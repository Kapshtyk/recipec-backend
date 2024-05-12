import { ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";

import { MongoClient } from "mongodb";
import * as request from "supertest";

import { AppModule } from "../src/app.module";

describe("App (e2e)", () => {
  let app;
  let db;
  let connection;

  beforeAll(async () => {
    connection = await MongoClient.connect(process.env.MONGO_URI, {});
    db = await connection.db("recipeAppDbTest");

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  beforeEach(async () => {
    await db.collection("users").deleteMany({});
  });

  it("registration pipeline (POST)", async () => {
    const registerResponse = await request(app.getHttpServer())
      .post("/auth/registration")
      .send({
        email: "test@example.com",
        username: "testuser",
        password: "Password123!",
      })
      .expect(201);

    const responseBody = JSON.parse(registerResponse.text);

    expect(responseBody).toEqual(
      expect.objectContaining({
        token: expect.any(String),
      }),
    );

    const loginResponse = await request(app.getHttpServer())
      .post("/auth/login")
      .send({
        email: "test@example.com",
        password: "Password123!",
      })
      .expect(201);

    const loginResponseBody = JSON.parse(loginResponse.text);

    expect(loginResponseBody).toEqual(
      expect.objectContaining({
        token: expect.any(String),
      }),
    );

    const users = await request(app.getHttpServer()).get("/users").expect(200);

    const usersResponseBody = JSON.parse(users.text);

    expect(usersResponseBody).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          email: "test@example.com",
          username: "testuser",
          _id: expect.any(String),
        }),
      ]),
    );

    let user = await request(app.getHttpServer())
      .get(`/users/${usersResponseBody[0]._id}`)
      .expect(200);

    const userResponseBody = JSON.parse(user.text);

    expect(userResponseBody).toEqual(
      expect.objectContaining({
        email: "test@example.com",
        username: "testuser",
        _id: usersResponseBody[0]._id,
      }),
    );

    const me = await request(app.getHttpServer())
      .get("/users/me")
      .set("Authorization", `Bearer ${loginResponseBody.token}`)
      .expect(200);

    const meResponseBody = JSON.parse(me.text);

    expect(meResponseBody).toEqual(
      expect.objectContaining({
        email: "test@example.com",
        username: "testuser",
        _id: usersResponseBody[0]._id,
      }),
    );

    await request(app.getHttpServer())
      .delete(`/users/${usersResponseBody[0]._id}`)
      .expect(401);

    await request(app.getHttpServer())
      .delete(`/users/${usersResponseBody[0]._id}`)
      .set("Authorization", `Bearer ${loginResponseBody.token}`)
      .expect(204);

    user = await request(app.getHttpServer())
      .get(`/users/${usersResponseBody[0]._id}`)
      .expect(200);

    expect(user.text).toEqual("");
  });

  it("check if the same email/username cannot be used twice (POST)", async () => {
    const user = {
      email: "test@example.com",
      username: "testuser",
      password: "Password123!",
    };
    await request(app.getHttpServer())
      .post("/auth/registration")
      .send(user)
      .expect(201);

    const userWithTheSameEmail = { ...user, username: "testuser2" };

    await request(app.getHttpServer())
      .post("/auth/registration")
      .send(userWithTheSameEmail)
      .expect(400);

    const userWithTheSameUsername = { ...user, email: "test@example2.com" };

    await request(app.getHttpServer())
      .post("/auth/registration")
      .send(userWithTheSameUsername)
      .expect(400);
  });

  it("check if empty email/username/password cannot be used (POST)", async () => {
    const user = {
      email: "test@example.com",
      username: "testuser",
      password: "Password123!",
    };
    await request(app.getHttpServer())
      .post("/auth/registration")
      .send()
      .expect(400);

    await request(app.getHttpServer())
      .post("/auth/registration")
      .send({ email: user.email, username: user.username })
      .expect(400);

    await request(app.getHttpServer())
      .post("/auth/registration")
      .send({ email: user.email, password: user.password })
      .expect(400);

    await request(app.getHttpServer())
      .post("/auth/registration")
      .send({ username: user.username, password: user.password })
      .expect(400);

    await request(app.getHttpServer())
      .post("/auth/registration")
      .send({ foo: "foo", bar: "bar" })
      .expect(400);

    await request(app.getHttpServer()).get("/users").expect(200).expect([]);
  });

  afterAll(async () => {
    await app.close();
    await connection.close();
  });
});

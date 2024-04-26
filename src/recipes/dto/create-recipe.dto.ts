export class CreateRecipeDto {
  title: string
  origin: string
  description: string
  instructions: string
  image: string
  ingredients: [
    {
      name: string
      units: string
      quantity: number
    }
  ]
}

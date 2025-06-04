import { Elysia, t } from 'elysia';
import birthdayService from './handler';


export const birthdayPostSchema = t.Object({
  name: t.String(),
  birthday_date: t.String(),
  profile_picture: t.File({ format: 'image/*', required: true }),
  phoneNumber: t.String({
    pattern: '^234[0-9]{10}$',
    error:
      'Phone number must start with 234 and be followed by exactly 10 digits',
  }),
  gender: t.Union([t.Literal('male'), t.Literal('female')])
});

export const birthdayUpdateSchema = t.Object({
  name: t.Optional(t.String()),
  birthday_date: t.Optional(t.Date()),
  profile_picture: t.Optional(t.File({ format: 'image/*', required: true })),
  phoneNumber: t.Optional(t.String({
    pattern: '^234[0-9]{10}$',
    error:
      'Phone number must start with 234 and be followed by exactly 10 digits',
  })),
  gender: t.Optional(t.Union([t.Literal('male'), t.Literal('female')]))
});


const birthdayRouter = new Elysia({ prefix: '/birthday' })
birthdayRouter.get("/", () => birthdayService.getUsers())
birthdayRouter.get('/:id', (context) => birthdayService.getUser(context))
birthdayRouter.post("/", (context) => birthdayService.createUser(context), {body: birthdayPostSchema})
birthdayRouter.put("/:id", (context) => birthdayService.updateUser(context), {body: birthdayUpdateSchema})
birthdayRouter.delete("/:id", (context) => birthdayService.deleteUser(context))


export default birthdayRouter;

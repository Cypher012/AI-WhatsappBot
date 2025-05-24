import { Elysia, t } from 'elysia';
import { eq } from 'drizzle-orm';
import { usersTable } from '@/db/schema';
import { db } from '@/db';
import { uploadImage } from '@/utils/cloudinary';

const birthdayRouter = new Elysia({ prefix: '/birthday' });

const birthdayPostSchema = t.Object({
  name: t.String(),
  birthday_date: t.String(), // ISO 8601 string (e.g. "2000-05-22T00:00:00Z")
  profile_picture: t.File({ format: 'image/*', required: true }),
  phoneNumber: t.String({
    pattern: '^234[0-9]{10}$',
    error:
      'Phone number must start with 234 and be followed by exactly 10 digits',
  }),
});

birthdayRouter.get('', async () => {
  const users = await db.select().from(usersTable);
  return users;
});

birthdayRouter.get('/:id', async (req) => {
  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, req.params.id));
  return user;
});

birthdayRouter.post(
  '',
  async ({ body }) => {
    console.log(body);
    const { profile_picture } = body;

    // Upload the image to Cloudinary
    const profile_url = await uploadImage(profile_picture);

    const upload = await db
      .insert(usersTable)
      .values({
        name: body.name,
        phoneNumber: body.phoneNumber,
        birthdayDate: new Date(body.birthday_date), // convert to Date
        profileUrl: profile_url,
      })
      .returning();

    console.log(upload);
    return upload;
  },
  {
    body: birthdayPostSchema,
  }
);

export default birthdayRouter;

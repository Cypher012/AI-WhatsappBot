import { eq } from 'drizzle-orm';
import { usersTable } from '@/db/schema';
import { db } from '@/db';
import { uploadImage } from '@/utils/cloudinary';
import {Context ,Static} from 'elysia';
import cloudinary from '@/utils/cloudinary';
import { birthdayPostSchema, birthdayUpdateSchema } from '.';


export type CreateUser = Static<typeof birthdayPostSchema>;
export type UpdateUser = Static<typeof birthdayUpdateSchema>;

class BirthdayService {
    static async getUsers(){
        const users = await db.select().from(usersTable);
        return users;
    }

    static async findUserById(id: string){
        const user = await db.select().from(usersTable).where(eq(usersTable.id, id))
        return user[0]
    }

    static async getUser(context: Context, userId?: string){
        const {params: {id}} = context
        return this.findUserById(id)
    }

    static async createUser(context: Context<{body: CreateUser}>){
        const {body: user, status} = context
        console.log(user);
        const {profile_picture } = user;
    
        // Upload the image to Cloudinary
        const {profileUrl, profileId} = await uploadImage(profile_picture);
    
        const upload = await db
          .insert(usersTable)
          .values({
            name: user.name,
            phoneNumber: user.phoneNumber,
            profilePublicId: profileId,
            profileUrl,
            birthdayDate: new Date(user.birthday_date),
            gender: user.gender
          })
          .returning();
    
        console.log(upload);
        return status("Created", upload[0])
    }

    static async updateUser(context: Context<{body: UpdateUser}>) {
        const {body: userData, params:{id}, status} = context

        const existingUser = await this.findUserById(id);
    
        if (!existingUser) {
          return status(404, { message: 'User not found' });
        }

        let profileUrl = existingUser.profileUrl;
        let profilePublicId = existingUser.profilePublicId;

    
        // If a new image is uploaded
        if (userData.profile_picture) {
            if (profilePublicId) {
            try {
                await cloudinary.uploader.destroy(profilePublicId);
            } catch (err) {
                console.warn('Failed to delete previous Cloudinary image:', err);
            }

            const newImage = await uploadImage(userData.profile_picture);
            profileUrl = newImage.profileUrl;
            profilePublicId = newImage.profileId;
            }
        }
    
        const updatedUser = await db
        .update(usersTable)
        .set({
        name: userData.name ?? existingUser.name,
        phoneNumber: userData.phoneNumber ?? existingUser.phoneNumber,
        birthdayDate: userData.birthday_date
            ? new Date(userData.birthday_date)
            : existingUser.birthdayDate,
        gender: userData.gender ?? existingUser.gender,
        profileUrl,
        profilePublicId
        })
        .where(eq(usersTable.id, id))
        .returning();
    
        return status(200, updatedUser[0]);
    }
    
      static async deleteUser(context: Context) {
        const {params: {id}, status} = context

        const user = await this.findUserById(id);
    
        if (!user) {
          return status(404, { message: 'User not found' });
        }
    
        if (user.profilePublicId) {
          try {
            await cloudinary.uploader.destroy(user.profilePublicId);
          } catch (err) {
            console.warn('Failed to delete Cloudinary image:', err);
          }
        }
    
        await db.delete(usersTable).where(eq(usersTable.id, id));
        return status("No Content", { message: 'User deleted successfully' });
      }
}

const birthdayService = BirthdayService

export default birthdayService

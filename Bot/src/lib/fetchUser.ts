export interface User {
    name: string;
    phoneNumber: string;
    birthdayDate: string;
    profileUrl: string;
    gender: string
}

interface RawUser extends User {
    id: string;
    createdAt: string;
    updatedAt: string;
}

const getUsers = async(): Promise<User[] | []> => {
    const baseUrl = `${Bun.env.BASE_URL}/birthday` || "http://localhost:8000/api/birthday";
    console.log(Bun.env.BASE_URL)
    console.log("baseUrl: ", baseUrl)
    if (!baseUrl) {
        console.error("BASE_URL environment variable is not set");
        return [];
    }

    try {
        const res = await fetch(baseUrl);
        if (!res.ok) {
            console.error("Unable to fetch data")
            return []
        };

        const rawData = await res.json() as RawUser[];
        
        // Transform the data to match our User type
        const users: User[] = rawData.map(({ id, createdAt, updatedAt, ...user }) => user);
        
        console.log(users);
        return users;
        
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
}

export default getUsers
export interface IUser {
    name: string;
    email: string;
    phone: string;
    password: string;
    bio:string;
    age:number;
    twitter:string;
    facebook:string;
    linkedin:string;
    instagram:string;
    profilePicture?: string;
    status: boolean;
    purchasedCourses?: string[];  
    wishlist?: string[];          
    created_At?: Date;
}
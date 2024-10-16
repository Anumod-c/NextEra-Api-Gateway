export interface ITutor {
    name: string;
    email: string;
    phone: string;
    password: string; 
    profilePicture?: string;
    status: boolean;         
    created_At?: Date;
}
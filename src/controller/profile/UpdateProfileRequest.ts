export interface UpdateProfileRequest {
    id: string;
    title: string;
    description: string;
    logoId: string,
    socialMediaLinks: string[];
}
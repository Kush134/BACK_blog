export interface BaseProfileDTO {
    id: string;
    title: string;
    description: string;
    logoId: string,
    socialMediaLinks: string[];
}

export interface UpdateProfileResponse extends BaseProfileDTO {
}
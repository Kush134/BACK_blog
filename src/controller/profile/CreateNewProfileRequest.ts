
export interface CreateNewProfileRequest {
    id: string,
    title: string,
    description: string,
    imageBase64: string,
    socialMediaLinks: string[]
}
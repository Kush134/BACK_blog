import { Image } from "@/s3/image";
import { ProfileDO } from "../repository/ProfileDO";
import { profileRepository } from "../repository/ProfileRepositoryImpl";
import { ProfileService } from "./ProfileService";
import { profileResourceRepository } from "../resource/ProfileResourceRepositoryImpl";

export class ProfileServiceImpl implements ProfileService {

    async getByAddress(address: string): Promise<ProfileDO | undefined> {
        return profileRepository.getByAddress(address);
    }

    async getById(id: string): Promise<ProfileDO|undefined> {
        return profileRepository.getById(id);
    }

    async save(profile: ProfileDO): Promise<ProfileDO> {
        await profileRepository.put(profile);
        return profile;
    }

    async getImage(id: string): Promise<Image> {
        return profileResourceRepository.getImage(id);
    }

    async saveImage(base64Image: string): Promise<string> {
       return profileResourceRepository.save(base64Image);
    }

    removeImage(id: string): Promise<void> {
        return profileResourceRepository.remove(id);
    }


    async uploadImage(id: string, base64Image: string): Promise<string> {
        await profileResourceRepository.update(id, base64Image);
        return id;
    }
}

const profileService: ProfileService = new ProfileServiceImpl();
export { profileService }
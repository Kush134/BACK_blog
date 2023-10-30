import { Image, getImage, save, update, remove} from "@/s3/image";
import { ProfileResourceRepository } from "./ProfileResourceRepository";

const ProfileImageBucket = "community-profile-images-1r34goy";

class ProfileResourceRepositoryImpl implements ProfileResourceRepository {

    async getImage(id: string): Promise<Image | undefined> {
        return getImage(ProfileImageBucket, id);
    }

    async save(base64Image: string): Promise<string> {
        return save(ProfileImageBucket, base64Image);
    }

    async remove(id: string): Promise<void> {
        return remove(ProfileImageBucket, id);
    }

    async update(id: string, newBase64Image: string): Promise<void> {
        return update(ProfileImageBucket, id, newBase64Image);
    }
}

const profileResourceRepository: ProfileResourceRepository = new ProfileResourceRepositoryImpl();
export {profileResourceRepository}
import {ProfileDO} from "./ProfileDO"

export interface ProfileRepository {

    getByAddress(address: string): Promise<ProfileDO | undefined>

    getById(id: string): Promise<ProfileDO | undefined>

    put(profile: ProfileDO): Promise<void>

}

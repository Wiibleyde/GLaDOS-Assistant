import { CommandInteraction, ButtonInteraction, ModalSubmitInteraction, CacheType, PermissionFlagsBits } from 'discord.js';
import { config } from '@/config';
import { logger } from './logger';


export namespace PermissionUtils {
    /**
     * Check if the user has the required permissions (PermissionsFlagsBits.Administrator bypasses all permissions)
     * @param interaction The interaction to check
     * @param permissionsToTests The permissions to check
     * @param exact If the user needs all the permissions or just one
     * @returns If the user has the required permissions
    * */
    export async function hasPermission(interaction: CommandInteraction|ButtonInteraction<CacheType>|ModalSubmitInteraction, permissionsToTests: bigint[], exact: boolean): Promise<boolean> {
        if(config.OWNER_ID == interaction.user.id) return true
        const member = await interaction.guild?.members.fetch(interaction.user.id)
        if(!member) return false
        if(member.permissions.has(PermissionFlagsBits.Administrator)) return true
        if(permissionsToTests.length == 0) return false
        if(exact) {
            return permissionsToTests.every(permission => member.permissions.has(permission))
        } else {
            return permissionsToTests.some(permission => member.permissions.has(permission))
        }
    }
}
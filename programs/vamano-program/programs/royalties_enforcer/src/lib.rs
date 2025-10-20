use anchor_lang::prelude::*;

declare_id!("11111111111111111111111111111111");

#[program]
pub mod royalties_enforcer {
    use super::*;

    pub fn enforce_royalties(ctx: Context<EnforceRoyalties>, sale_amount: u64) -> Result<()> {
        let total_royalty = sale_amount.checked_mul(1000).unwrap().checked_div(10000).unwrap();
        let artist_share = total_royalty.checked_mul(5).unwrap().checked_div(10).unwrap();
        let organizer_share = total_royalty.checked_mul(3).unwrap().checked_div(10).unwrap();
        let platform_share = total_royalty.checked_mul(2).unwrap().checked_div(10).unwrap();

        emit!(RoyaltiesEnforced {
            sale_amount,
            total_royalty,
            artist_share,
            organizer_share,
            platform_share,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct EnforceRoyalties<'info> {
    /// CHECK: seller account (USDC source) referenced for SPL CPI in future
    pub seller: AccountInfo<'info>,
    /// CHECK: artist recipient vault (e.g., USDC ATA). SPL transfer checks will be enforced in CPI.
    #[account(mut)]
    pub artist: AccountInfo<'info>,
    /// CHECK: organizer recipient vault (e.g., USDC ATA). SPL transfer checks will be enforced in CPI.
    #[account(mut)]
    pub organizer: AccountInfo<'info>,
    /// CHECK: platform recipient vault (e.g., USDC ATA). SPL transfer checks will be enforced in CPI.
    #[account(mut)]
    pub platform: AccountInfo<'info>,
}

#[event]
pub struct RoyaltiesEnforced {
    pub sale_amount: u64,
    pub total_royalty: u64,
    pub artist_share: u64,
    pub organizer_share: u64,
    pub platform_share: u64,
}



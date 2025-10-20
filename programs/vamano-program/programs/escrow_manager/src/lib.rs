use anchor_lang::prelude::*;

declare_id!("11111111111111111111111111111111");

#[program]
pub mod escrow_manager {
    use super::*;

    pub fn deposit_escrow(_ctx: Context<DepositEscrow>, _amount: u64) -> Result<()> {
        // SPL Token CPI to move USDC into escrow PDA will be added later
        Ok(())
    }

    pub fn release_escrow(_ctx: Context<ReleaseEscrow>, _amount: u64) -> Result<()> {
        // SPL Token CPI to move USDC from escrow to organizer vault will be added later
        Ok(())
    }
}

#[derive(Accounts)]
pub struct DepositEscrow<'info> {
    /// CHECK: Event PDA reference
    pub event: AccountInfo<'info>,
    /// CHECK: Escrow PDA managed by this program
    #[account(mut)]
    pub escrow_pda: AccountInfo<'info>,
    pub buyer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ReleaseEscrow<'info> {
    /// CHECK: Event PDA reference
    pub event: AccountInfo<'info>,
    /// CHECK: Escrow PDA managed by this program
    #[account(mut)]
    pub escrow_pda: AccountInfo<'info>,
    /// CHECK: Organizer vault (USDC ATA)
    #[account(mut)]
    pub organizer_vault: AccountInfo<'info>,
    /// CHECK: Program authority PDA
    pub program_authority: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}



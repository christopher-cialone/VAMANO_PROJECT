use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, TransferChecked};

declare_id!("11111111111111111111111111111111");

#[program]
pub mod escrow_manager {
    use super::*;

    pub fn deposit_escrow(ctx: Context<DepositEscrow>, amount: u64, decimals: u8) -> Result<()> {
        // Transfer USDC from buyer ATA to escrow ATA using transfer_checked
        let cpi_accounts = TransferChecked {
            from: ctx.accounts.buyer_ata.to_account_info(),
            mint: ctx.accounts.usdc_mint.to_account_info(),
            to: ctx.accounts.escrow_ata.to_account_info(),
            authority: ctx.accounts.buyer.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
        token::transfer_checked(cpi_ctx, amount, decimals)?;
        Ok(())
    }

    pub fn release_escrow(ctx: Context<ReleaseEscrow>, amount: u64, decimals: u8, authority_bump: u8) -> Result<()> {
        // Transfer USDC from escrow ATA to organizer ATA, signed by program authority PDA
        let seeds: &[&[u8]] = &[b"authority", ctx.accounts.event.key().as_ref(), &[authority_bump]];
        let signer = &[seeds];

        let cpi_accounts = TransferChecked {
            from: ctx.accounts.escrow_ata.to_account_info(),
            mint: ctx.accounts.usdc_mint.to_account_info(),
            to: ctx.accounts.organizer_ata.to_account_info(),
            authority: ctx.accounts.program_authority.to_account_info(),
        };
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts,
            signer,
        );
        token::transfer_checked(cpi_ctx, amount, decimals)?;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct DepositEscrow<'info> {
    /// CHECK: Event PDA reference (key used in PDA derivations)
    pub event: AccountInfo<'info>,
    /// Buyer paying for the ticket
    #[account(mut)]
    pub buyer: Signer<'info>,
    /// USDC Mint
    pub usdc_mint: Account<'info, Mint>,
    /// Buyer's USDC ATA
    #[account(mut)]
    pub buyer_ata: Account<'info, TokenAccount>,
    /// Escrow USDC ATA owned by program authority PDA
    #[account(mut)]
    pub escrow_ata: Account<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ReleaseEscrow<'info> {
    /// CHECK: Event PDA reference (key used in PDA derivations)
    pub event: AccountInfo<'info>,
    /// Program authority PDA (escrow authority)
    /// CHECK: PDA signer; seeds [b"authority", event]
    pub program_authority: AccountInfo<'info>,
    /// USDC Mint
    pub usdc_mint: Account<'info, Mint>,
    /// Escrow USDC ATA (source)
    #[account(mut)]
    pub escrow_ata: Account<'info, TokenAccount>,
    /// Organizer USDC ATA (destination)
    #[account(mut)]
    pub organizer_ata: Account<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}



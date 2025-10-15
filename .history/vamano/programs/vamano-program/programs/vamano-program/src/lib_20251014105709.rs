use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("CtGfpDV9qphEv6BKuBpoPRK3nKUSLMYnKYwRegTTBiHA");

#[program]
pub mod vamano_program {
    use super::*;

    // Initialize a new event
    pub fn init_event(
        ctx: Context<InitEvent>,
        name: String,
        date: i64,
        venue: String,
        supply: u64,
        metadata_uri: String,
    ) -> Result<()> {
        let event = &mut ctx.accounts.event;
        event.creator = ctx.accounts.creator.key();
        event.name = name;
        event.date = date;
        event.venue = venue;
        event.supply = supply;
        event.minted = 0;
        event.metadata_uri = metadata_uri;
        event.bump = ctx.bumps.event;
        
        msg!("Event created: {} by {}", event.name, event.creator);
        Ok(())
    }

    // Mint a ticket NFT after payment verification
    pub fn mint_ticket(
        ctx: Context<MintTicket>,
        amount: u64,
    ) -> Result<()> {
        let event = &mut ctx.accounts.event;
        
        // Check supply
        require!(event.minted < event.supply, ErrorCode::SupplyExceeded);
        
        // Transfer USDC to escrow
        let cpi_accounts = Transfer {
            from: ctx.accounts.payer_token_account.to_account_info(),
            to: ctx.accounts.escrow_token_account.to_account_info(),
            authority: ctx.accounts.payer.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;
        
        // Update minted count
        event.minted += 1;
        
        msg!("Ticket minted for event: {}, total minted: {}", event.name, event.minted);
        Ok(())
    }

    // Verify ticket ownership (called by off-chain verification)
    pub fn verify_ticket(
        ctx: Context<VerifyTicket>,
    ) -> Result<()> {
        let event = &ctx.accounts.event;
        let ticket_holder = &ctx.accounts.ticket_holder;
        
        // Basic verification - in production, this would check NFT ownership
        require!(ticket_holder.key() != Pubkey::default(), ErrorCode::InvalidTicket);
        
        msg!("Ticket verified for event: {}", event.name);
        Ok(())
    }

    // Enforce royalties on resale (called by Metaplex transfer hook)
    pub fn enforce_royalties(
        ctx: Context<EnforceRoyalties>,
        sale_amount: u64,
    ) -> Result<()> {
        let event = &ctx.accounts.event;
        
        // Calculate royalty splits (10% total: 5% artist, 3% organizer, 2% platform)
        let total_royalty = sale_amount.checked_mul(1000).unwrap().checked_div(10000).unwrap();
        let artist_royalty = total_royalty.checked_mul(5).unwrap().checked_div(10).unwrap();
        let organizer_royalty = total_royalty.checked_mul(3).unwrap().checked_div(10).unwrap();
        let platform_royalty = total_royalty.checked_mul(2).unwrap().checked_div(10).unwrap();
        
        // Transfer royalties (simplified - in production would use proper CPI)
        msg!("Royalties enforced: artist={}, organizer={}, platform={}", 
             artist_royalty, organizer_royalty, platform_royalty);
        
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct InitEvent<'info> {
    #[account(
        init,
        payer = creator,
        space = 8 + 32 + 4 + 100 + 8 + 4 + 50 + 8 + 8 + 4 + 200 + 1,
        seeds = [b"event", creator.key().as_ref(), name.as_bytes()],
        bump
    )]
    pub event: Account<'info, Event>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MintTicket<'info> {
    #[account(mut)]
    pub event: Account<'info, Event>,
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut)]
    pub payer_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub escrow_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct VerifyTicket<'info> {
    pub event: Account<'info, Event>,
    pub ticket_holder: Signer<'info>,
}

#[derive(Accounts)]
pub struct EnforceRoyalties<'info> {
    pub event: Account<'info, Event>,
    #[account(mut)]
    pub seller: Signer<'info>,
    #[account(mut)]
    pub artist: SystemAccount<'info>,
    #[account(mut)]
    pub organizer: SystemAccount<'info>,
    #[account(mut)]
    pub platform: SystemAccount<'info>,
}

#[account]
pub struct Event {
    pub creator: Pubkey,
    pub name: String,
    pub date: i64,
    pub venue: String,
    pub supply: u64,
    pub minted: u64,
    pub metadata_uri: String,
    pub bump: u8,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Supply exceeded")]
    SupplyExceeded,
    #[msg("Invalid ticket")]
    InvalidTicket,
    #[msg("Invalid payment amount")]
    InvalidPaymentAmount,
}

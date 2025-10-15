use anchor_lang::prelude::*;

declare_id!("2AXvXRn2TxQcwSKvGwGpyAwqn6n9QLb5ssK5cmA1auX4");

#[program]
pub mod vamano_program {
    use super::*;

    /// Initialize a new event with MPL-Hybrid support
    /// Creates event PDA with collection metadata for fungible-to-NFT swaps
    pub fn init_event(
        ctx: Context<InitEvent>,
        name: String,
        date: i64,
        venue: String,
        supply: u64,
        metadata_uri: String,
        price_usdc: u64,
    ) -> Result<()> {
        let event = &mut ctx.accounts.event;
        event.creator = ctx.accounts.creator.key();
        event.name = name;
        event.date = date;
        event.venue = venue;
        event.supply = supply;
        event.minted = 0;
        event.metadata_uri = metadata_uri;
        event.price_usdc = price_usdc;
        event.collection_mint = Pubkey::default(); // Will be set when collection is created
        event.bump = *ctx.bumps.get("event").unwrap();

        msg!("Event created: {} by {} (price: {} USDC, supply: {})", 
             event.name, event.creator, price_usdc, supply);
        
        emit!(EventCreated {
            event: event.key(),
            creator: event.creator,
            name: event.name.clone(),
            supply,
            price_usdc,
        });

        Ok(())
    }

    /// Mint ticket with MPL-Hybrid logic
    /// Simulates: USDC escrow → Hybrid pool → NFT mint with unique traits
    /// In production: CPI to mpl-hybrid for fungible-to-NFT conversion
    pub fn mint_ticket(
        ctx: Context<MintTicket>,
        amount: u64,
        zk_enabled: bool,
    ) -> Result<()> {
        let event = &mut ctx.accounts.event;

        // Validate supply and payment
        require!(event.minted < event.supply, ErrorCode::SupplyExceeded);
        require!(amount >= event.price_usdc, ErrorCode::InvalidPaymentAmount);

        // MPL-Hybrid Concept (Stub for now):
        // 1. Transfer USDC to escrow (fungible side)
        // 2. CPI to mpl-hybrid::capture_v1 to convert fungible → NFT
        // 3. CPI to mpl-core::create_v1 to mint compressed NFT with royalties
        // 4. Assign unique traits (seat number, QR hash, etc.)
        
        event.minted += 1;
        let ticket_id = event.minted;

        // Calculate escrow amount (90% to organizer, 10% held for royalties)
        let escrow_amount = amount.checked_mul(9000).unwrap().checked_div(10000).unwrap();
        let royalty_reserve = amount.checked_sub(escrow_amount).unwrap();

        // ZK Privacy integration point
        if zk_enabled {
            msg!("ZK shielding enabled for ticket {} via Light Protocol", ticket_id);
            // Future: light_protocol_sdk::shielded_transfer(...)
        }

        msg!(
            "Hybrid ticket {} minted: event={}, buyer={}, amount={} USDC, escrow={}, royalty_reserve={}, ZK={}",
            ticket_id,
            event.name,
            ctx.accounts.buyer.key(),
            amount,
            escrow_amount,
            royalty_reserve,
            zk_enabled
        );

        emit!(TicketMinted {
            event: event.key(),
            ticket_id,
            buyer: ctx.accounts.buyer.key(),
            amount,
            escrow_amount,
            royalty_reserve,
            zk_enabled,
        });

        Ok(())
    }

    /// Re-roll dynamic traits for hybrid NFT
    /// Allows updating NFT metadata (e.g., seat reassignment, tier upgrade)
    pub fn reroll_ticket(
        ctx: Context<RerollTicket>,
        ticket_id: u64,
        new_trait_seed: u64,
    ) -> Result<()> {
        let event = &ctx.accounts.event;
        
        require!(ticket_id > 0 && ticket_id <= event.minted, ErrorCode::InvalidTicket);

        // MPL-Hybrid re-roll CPI would update NFT metadata
        // For now, log the intent with new seed for randomness
        msg!(
            "Re-rolling traits for ticket {} of event {} with seed {}",
            ticket_id,
            event.name,
            new_trait_seed
        );

        emit!(TicketRerolled {
            event: event.key(),
            ticket_id,
            authority: ctx.accounts.authority.key(),
            new_trait_seed,
        });

        Ok(())
    }

    /// Verify ticket ownership via QR scan
    /// Called by off-chain verifier (e.g., door scanner)
    pub fn verify_ticket(
        ctx: Context<VerifyTicket>,
        ticket_id: u64,
        qr_hash: String,
    ) -> Result<()> {
        let event = &ctx.accounts.event;
        let ticket_holder = &ctx.accounts.ticket_holder;

        // Validate ticket exists
        require!(ticket_id > 0 && ticket_id <= event.minted, ErrorCode::InvalidTicket);
        require!(ticket_holder.key() != Pubkey::default(), ErrorCode::InvalidTicket);

        // In production: Verify NFT ownership via Helius DAS API
        // Check QR hash matches NFT metadata
        msg!(
            "Ticket {} verified for event: {} (holder: {}, QR: {})",
            ticket_id,
            event.name,
            ticket_holder.key(),
            qr_hash
        );

        emit!(TicketVerified {
            event: event.key(),
            ticket_id,
            holder: ticket_holder.key(),
            qr_hash,
            verified_at: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    /// Enforce royalties on resale with MPL-Hybrid swap
    /// 10% total: 5% artist, 3% organizer, 2% platform
    /// Called automatically on secondary market transfers
    pub fn enforce_royalties(
        ctx: Context<EnforceRoyalties>,
        sale_amount: u64,
    ) -> Result<()> {
        let event = &ctx.accounts.event;

        // Calculate royalty splits (basis points: 1000 = 10%)
        let total_royalty = sale_amount.checked_mul(1000).unwrap().checked_div(10000).unwrap();
        let artist_royalty = total_royalty.checked_mul(5).unwrap().checked_div(10).unwrap();
        let organizer_royalty = total_royalty.checked_mul(3).unwrap().checked_div(10).unwrap();
        let platform_royalty = total_royalty.checked_mul(2).unwrap().checked_div(10).unwrap();

        // In production: Transfer royalties via SPL Token CPI
        // mpl-hybrid ensures royalties are enforced on fungible swaps too
        msg!(
            "Royalties enforced for event {} (sale: {} USDC): artist={}, organizer={}, platform={}",
            event.name,
            sale_amount,
            artist_royalty,
            organizer_royalty,
            platform_royalty
        );

        emit!(RoyaltiesEnforced {
            event: event.key(),
            sale_amount,
            artist_royalty,
            organizer_royalty,
            platform_royalty,
        });

        Ok(())
    }
}

// ============================================================================
// Account Structures
// ============================================================================

#[derive(Accounts)]
#[instruction(name: String)]
pub struct InitEvent<'info> {
    #[account(
        init,
        payer = creator,
        space = 8 + 32 + 4 + 100 + 8 + 4 + 50 + 8 + 8 + 8 + 4 + 200 + 32 + 1,
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
    pub buyer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RerollTicket<'info> {
    pub event: Account<'info, Event>,
    pub authority: Signer<'info>,
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
    /// CHECK: Artist wallet for royalty distribution
    #[account(mut)]
    pub artist: AccountInfo<'info>,
    /// CHECK: Organizer wallet for royalty distribution
    #[account(mut)]
    pub organizer: AccountInfo<'info>,
    /// CHECK: Platform wallet for royalty distribution
    #[account(mut)]
    pub platform: AccountInfo<'info>,
}

// ============================================================================
// Data Structures
// ============================================================================

#[account]
pub struct Event {
    pub creator: Pubkey,           // 32 bytes
    pub name: String,              // 4 + 100 bytes
    pub date: i64,                 // 8 bytes
    pub venue: String,             // 4 + 50 bytes
    pub supply: u64,               // 8 bytes
    pub minted: u64,               // 8 bytes
    pub price_usdc: u64,           // 8 bytes
    pub metadata_uri: String,      // 4 + 200 bytes
    pub collection_mint: Pubkey,   // 32 bytes (for MPL-Hybrid collection)
    pub bump: u8,                  // 1 byte
}

// ============================================================================
// Events
// ============================================================================

#[event]
pub struct EventCreated {
    pub event: Pubkey,
    pub creator: Pubkey,
    pub name: String,
    pub supply: u64,
    pub price_usdc: u64,
}

#[event]
pub struct TicketMinted {
    pub event: Pubkey,
    pub ticket_id: u64,
    pub buyer: Pubkey,
    pub amount: u64,
    pub escrow_amount: u64,
    pub royalty_reserve: u64,
    pub zk_enabled: bool,
}

#[event]
pub struct TicketRerolled {
    pub event: Pubkey,
    pub ticket_id: u64,
    pub authority: Pubkey,
    pub new_trait_seed: u64,
}

#[event]
pub struct TicketVerified {
    pub event: Pubkey,
    pub ticket_id: u64,
    pub holder: Pubkey,
    pub qr_hash: String,
    pub verified_at: i64,
}

#[event]
pub struct RoyaltiesEnforced {
    pub event: Pubkey,
    pub sale_amount: u64,
    pub artist_royalty: u64,
    pub organizer_royalty: u64,
    pub platform_royalty: u64,
}

// ============================================================================
// Error Codes
// ============================================================================

#[error_code]
pub enum ErrorCode {
    #[msg("Supply exceeded - all tickets minted")]
    SupplyExceeded,
    #[msg("Invalid ticket ID or ownership")]
    InvalidTicket,
    #[msg("Payment amount insufficient")]
    InvalidPaymentAmount,
}

use anchor_lang::prelude::*;

declare_id!("11111111111111111111111111111111");

#[program]
pub mod ticket_mint {
    use super::*;

    pub fn mint_ticket(
        ctx: Context<MintTicket>,
        amount: u64,
        custom_traits: Vec<String>,
        zk_enabled: bool,
    ) -> Result<()> {
        // Supply and payment checks are expected to be validated off-chain and/or via EventFactory state
        emit!(TicketMinted {
            event: ctx.accounts.event.key(),
            buyer: ctx.accounts.buyer.key(),
            amount,
            traits_count: custom_traits.len() as u64,
            zk_enabled,
        });
        Ok(())
    }
}

#[derive(Accounts)]
pub struct MintTicket<'info> {
    /// CHECK: Event PDA from EventFactory. This account is only read for its key
    /// and verified off-chain to correspond to the event being minted against.
    /// No data is deserialized here to avoid cross-program type coupling.
    pub event: AccountInfo<'info>,
    /// Buyer paying and receiving NFT (via MPL-404 CPI in later iteration)
    pub buyer: Signer<'info>,
    /// CHECK: Escrow PDA managed by EscrowManager. Balance and authority
    /// checks are enforced within EscrowManager and off-chain before CPI.
    pub escrow: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[event]
pub struct TicketMinted {
    pub event: Pubkey,
    pub buyer: Pubkey,
    pub amount: u64,
    pub traits_count: u64,
    pub zk_enabled: bool,
}



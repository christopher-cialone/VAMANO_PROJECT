use anchor_lang::prelude::*;

declare_id!("11111111111111111111111111111111");

#[program]
pub mod event_factory {
    use super::*;

    pub fn init_event(
        ctx: Context<InitEvent>,
        name: String,
        date: i64,
        venue: String,
        supply: u64,
        price_usdc: u64,
        base_traits: Vec<String>,
    ) -> Result<()> {
        let event = &mut ctx.accounts.event_pda;
        event.creator = ctx.accounts.creator.key();
        event.name = name;
        event.date = date;
        event.venue = venue;
        event.supply = supply;
        event.price_usdc = price_usdc;
        event.base_traits = base_traits;
        event.bump = *ctx.bumps.get("event_pda").unwrap();

        emit!(EventCreated { id: event.key() });
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct InitEvent<'info> {
    #[account(
        init,
        payer = creator,
        space = 8 + 32 + 4 + 100 + 8 + 4 + 50 + 8 + 8 + 4 + 200 + 1 + 4 + (32 * 16),
        seeds = [b"event", creator.key().as_ref(), name.as_bytes()],
        bump
    )]
    pub event_pda: Account<'info, Event>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Event {
    pub creator: Pubkey,
    pub name: String,
    pub date: i64,
    pub venue: String,
    pub supply: u64,
    pub price_usdc: u64,
    pub metadata_uri: String, // reserved for future extension
    pub bump: u8,
    pub base_traits: Vec<String>, // e.g. ["seat:A1-A100","perk:drink"]
}

#[event]
pub struct EventCreated {
    pub id: Pubkey,
}



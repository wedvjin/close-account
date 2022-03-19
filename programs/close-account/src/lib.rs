use anchor_lang::prelude::*;
use anchor_spl::token::{TokenAccount};

declare_id!("DgXwx6Pz4fg3Si6zbt581SRd85XohCL64pay2DeWras5");

#[program]
pub mod close_account {
    use super::*;
    pub fn initialize(ctx: Context<Initialize>, bump: u8, tokens_bump: u8) -> ProgramResult {
        
    	ctx.accounts.programs_data.bump = bump;
    	ctx.accounts.programs_data.tokens_bump = tokens_bump;
    	ctx.accounts.programs_data.is_initialized = true;

        Ok(())
    }
    pub fn close(ctx: Context<Initialize>) -> ProgramResult {
        
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            anchor_spl::token::CloseAccount {
                account: ctx.accounts.programs_vault.to_account_info(),
                destination: ctx.accounts.authority.to_account_info(),
                authority: ctx.accounts.programs_data.to_account_info(),
            }
        );

        let bump = ctx.accounts.programs_data.bump;

        let seeds = &[b"data".as_ref(), 
        	ctx.accounts.authority.key.as_ref(),
            &[bump]];
		
        anchor_spl::token::close_account(cpi_ctx.with_signer(&[&seeds[..]]), )?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
	#[account(mut)]
	pub authority: Signer<'info>,
	pub mint: AccountInfo<'info>,
	#[account(
		init,
		payer = authority,
        token::mint = mint,
        token::authority = programs_data,
		seeds = [b"vault".as_ref(),mint.key.as_ref()],
		bump,
		)]
	pub programs_vault: Account<'info, TokenAccount>,

	#[account(
		init,
		payer = authority,
		seeds = [b"data".as_ref(),authority.key.as_ref()],
		bump,
		)]
	pub programs_data: Account<'info, Data>,

	pub token_program: AccountInfo<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct Close<'info> {
	#[account(mut)]
	pub authority: Signer<'info>,
	pub mint: AccountInfo<'info>,
	#[account(mut)]
	pub programs_vault: Account<'info, TokenAccount>,
	#[account(mut)]
	pub programs_data: Account<'info, Data>,

	pub token_program: AccountInfo<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: AccountInfo<'info>,
}

#[account]
#[derive(Default)]
pub struct Data {
	pub is_initialized: bool,
	pub bump: u8,
	pub tokens_bump: u8,
}
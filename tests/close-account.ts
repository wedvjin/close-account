import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { CloseAccount } from '../target/types/close_account';

import { TOKEN_PROGRAM_ID, Token } from "@solana/spl-token";

const provider = anchor.Provider.local();
const authority = anchor.web3.Keypair.generate();

let mint = null as Token;
let randomToken = null as anchor.web3.PublicKey;

// let programsVaults = null as anchor.web3.PublicKey;
// let programsData = null as anchor.web3.PublicKey;

let programsDataAccount = null as anchor.web3.PublicKey;
let programsVaultsAccount = null as anchor.web3.PublicKey;

let programsDataAccount_bump = null as number;
let programsVaultsAccount_bump = null as number;


describe('close-account', () => {

  // Configure the client to use the local cluster.
  anchor.setProvider(provider);

  const program = anchor.workspace.CloseAccount as Program<CloseAccount>;

  it('Init env', async () => {
  	await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(authority.publicKey, 3 * anchor.web3.LAMPORTS_PER_SOL),
      "processed"
    );
    mint = await Token.createMint(
      provider.connection,
      authority,
      authority.publicKey,
      null,
      5,
      TOKEN_PROGRAM_ID
    );
    // randomToken = await mint.createAccount(authority.publicKey);
    // await mint.mintTo(
    //   randomToken,
    //   authority.publicKey,
    //   [authority],
    //   10000000 // 100
    // );
    [programsDataAccount, programsDataAccount_bump] = await anchor.web3.PublicKey.findProgramAddress(
      [anchor.utils.bytes.utf8.encode("data"),authority.publicKey.toBuffer()],
      program.programId
    );
    [programsVaultsAccount, programsVaultsAccount_bump] = await anchor.web3.PublicKey.findProgramAddress(
      [anchor.utils.bytes.utf8.encode("vault"),mint.publicKey.toBuffer()],
      program.programId
    );
  });
	console.log("authority")
	console.log(authority.publicKey)
	console.log("mint")
  console.log(mint)
  console.log("programsDataAccount")
  console.log(programsDataAccount)
  console.log("programsVaultsAccount")
  console.log(programsVaultsAccount)
  it('initialize', async () => {
    // Add your test here.
    const tx = await program.rpc.initialize(
    	programsDataAccount_bump,
    	programsVaultsAccount_bump,
    	{
    		accounts: {

    			authority: authority.publicKey,
		      mint: mint.publicKey,
		      programsVault: programsVaultsAccount,
		      programsData: programsDataAccount,

    			tokenProgram: TOKEN_PROGRAM_ID,
		      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
		      systemProgram: anchor.web3.SystemProgram.programId,
    		},
    		signers: [authority],
    	});
    console.log("Your transaction signature", tx);
  });
  it('Close', async () => {
    // Add your test here.
    const tx = await program.rpc.close(
    	{
    		accounts: {
    			authority: authority.publicKey,
		      mint: mint.publicKey,
		      programsVault: programsVaultsAccount,
		      programsData: programsDataAccount,
    			tokenProgram: TOKEN_PROGRAM_ID,
		      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
		      systemProgram: anchor.web3.SystemProgram.programId,
    		},
    		signers: [authority],
    	});
    console.log("Your transaction signature", tx);
  });
});

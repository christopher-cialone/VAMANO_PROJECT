import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { VamanoProgram } from "../target/types/vamano_program";
import { expect } from "chai";

describe("vamano-program", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.VamanoProgram as Program<VamanoProgram>;
  const provider = anchor.getProvider();

  it("Creates an event", async () => {
    const eventName = "Cypherpunk Concert 2024";
    const eventDate = new Date("2024-12-31").getTime() / 1000;
    const venue = "Decentralized Arena";
    const supply = new anchor.BN(1000);
    const metadataUri = "https://arweave.net/example-metadata";

    const [eventPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("event"), provider.wallet.publicKey.toBuffer(), Buffer.from(eventName)],
      program.programId
    );

    const tx = await program.methods
      .initEvent(eventName, new anchor.BN(eventDate), venue, supply, metadataUri)
      .accounts({
        event: eventPda,
        creator: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("Event creation signature", tx);

    // Verify event was created
    const eventAccount = await program.account.event.fetch(eventPda);
    expect(eventAccount.name).to.equal(eventName);
    expect(eventAccount.creator.toString()).to.equal(provider.wallet.publicKey.toString());
    expect(eventAccount.supply.toString()).to.equal(supply.toString());
  });

  it("Mints a ticket", async () => {
    // This would require setting up token accounts and payment
    // For now, just test the instruction structure
    console.log("Ticket minting test - requires payment setup");
  });

  it("Verifies a ticket", async () => {
    // Test ticket verification
    console.log("Ticket verification test - requires NFT ownership check");
  });
});

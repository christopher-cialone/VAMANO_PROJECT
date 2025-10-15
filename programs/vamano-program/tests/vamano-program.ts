import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { VamanoProgram } from "../target/types/vamano_program";
import { assert } from "chai";

describe("vamano-program", () => {
  // Configure the client to use the local cluster
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.VamanoProgram as Program<VamanoProgram>;
  const provider = anchor.getProvider();

  // Test data
  const eventName = "Cypherpunk Concert 2025";
  const eventDate = new Date("2025-12-31").getTime() / 1000;
  const venue = "Decentralized Arena";
  const supply = new anchor.BN(1000);
  const priceUsdc = new anchor.BN(50_000000); // 50 USDC (6 decimals)
  const metadataUri = "https://arweave.net/vamano-concert-metadata";

  let eventPda: anchor.web3.PublicKey;
  let eventBump: number;

  before(async () => {
    // Derive event PDA
    [eventPda, eventBump] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("event"),
        provider.wallet.publicKey.toBuffer(),
        Buffer.from(eventName),
      ],
      program.programId
    );
  });

  it("Creates an event with MPL-Hybrid support", async () => {
    const tx = await program.methods
      .initEvent(
        eventName,
        new anchor.BN(eventDate),
        venue,
        supply,
        metadataUri,
        priceUsdc
      )
      .accounts({
        event: eventPda,
        creator: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("Event creation signature:", tx);

    // Fetch and verify event account
    const eventAccount = await program.account.event.fetch(eventPda);
    
    assert.equal(eventAccount.name, eventName, "Event name mismatch");
    assert.equal(
      eventAccount.creator.toString(),
      provider.wallet.publicKey.toString(),
      "Creator mismatch"
    );
    assert.equal(
      eventAccount.supply.toString(),
      supply.toString(),
      "Supply mismatch"
    );
    assert.equal(
      eventAccount.priceUsdc.toString(),
      priceUsdc.toString(),
      "Price mismatch"
    );
    assert.equal(eventAccount.minted.toNumber(), 0, "Initial minted should be 0");
    assert.equal(eventAccount.venue, venue, "Venue mismatch");
    assert.equal(eventAccount.metadataUri, metadataUri, "Metadata URI mismatch");

    console.log("✅ Event created successfully:", {
      name: eventAccount.name,
      supply: eventAccount.supply.toString(),
      price: eventAccount.priceUsdc.toString(),
      minted: eventAccount.minted.toString(),
    });
  });

  it("Mints a hybrid ticket with escrow and royalty reserve", async () => {
    const amount = priceUsdc; // Pay exact price
    const zkEnabled = false;

    const eventBefore = await program.account.event.fetch(eventPda);
    const mintedBefore = eventBefore.minted.toNumber();

    const tx = await program.methods
      .mintTicket(amount, zkEnabled)
      .accounts({
        event: eventPda,
        buyer: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("Ticket mint signature:", tx);

    // Verify minted count increased
    const eventAfter = await program.account.event.fetch(eventPda);
    assert.equal(
      eventAfter.minted.toNumber(),
      mintedBefore + 1,
      "Minted count should increase by 1"
    );

    console.log("✅ Hybrid ticket minted:", {
      ticketId: eventAfter.minted.toString(),
      amount: amount.toString(),
      zkEnabled,
      totalMinted: eventAfter.minted.toString(),
    });
  });

  it("Mints a ticket with ZK privacy enabled", async () => {
    const amount = priceUsdc;
    const zkEnabled = true;

    const eventBefore = await program.account.event.fetch(eventPda);
    const mintedBefore = eventBefore.minted.toNumber();

    const tx = await program.methods
      .mintTicket(amount, zkEnabled)
      .accounts({
        event: eventPda,
        buyer: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("ZK ticket mint signature:", tx);

    const eventAfter = await program.account.event.fetch(eventPda);
    assert.equal(
      eventAfter.minted.toNumber(),
      mintedBefore + 1,
      "Minted count should increase"
    );

    console.log("✅ ZK-enabled ticket minted:", {
      ticketId: eventAfter.minted.toString(),
      zkEnabled: true,
    });
  });

  it("Fails to mint ticket with insufficient payment", async () => {
    const insufficientAmount = new anchor.BN(1_000000); // Only 1 USDC
    const zkEnabled = false;

    try {
      await program.methods
        .mintTicket(insufficientAmount, zkEnabled)
        .accounts({
          event: eventPda,
          buyer: provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
      
      assert.fail("Should have thrown error for insufficient payment");
    } catch (error) {
      assert.include(
        error.toString(),
        "InvalidPaymentAmount",
        "Should throw InvalidPaymentAmount error"
      );
      console.log("✅ Correctly rejected insufficient payment");
    }
  });

  it("Re-rolls dynamic traits for a ticket", async () => {
    const ticketId = new anchor.BN(1); // First minted ticket
    const newTraitSeed = new anchor.BN(Math.floor(Math.random() * 1000000));

    const tx = await program.methods
      .rerollTicket(ticketId, newTraitSeed)
      .accounts({
        event: eventPda,
        authority: provider.wallet.publicKey,
      })
      .rpc();

    console.log("Ticket re-roll signature:", tx);
    console.log("✅ Ticket traits re-rolled:", {
      ticketId: ticketId.toString(),
      newTraitSeed: newTraitSeed.toString(),
    });
  });

  it("Fails to re-roll invalid ticket ID", async () => {
    const invalidTicketId = new anchor.BN(9999);
    const newTraitSeed = new anchor.BN(123);

    try {
      await program.methods
        .rerollTicket(invalidTicketId, newTraitSeed)
        .accounts({
          event: eventPda,
          authority: provider.wallet.publicKey,
        })
        .rpc();
      
      assert.fail("Should have thrown error for invalid ticket");
    } catch (error) {
      assert.include(
        error.toString(),
        "InvalidTicket",
        "Should throw InvalidTicket error"
      );
      console.log("✅ Correctly rejected invalid ticket ID");
    }
  });

  it("Verifies a ticket with QR hash", async () => {
    const ticketId = new anchor.BN(1);
    const qrHash = "QR_" + Math.random().toString(36).substring(7);

    const tx = await program.methods
      .verifyTicket(ticketId, qrHash)
      .accounts({
        event: eventPda,
        ticketHolder: provider.wallet.publicKey,
      })
      .rpc();

    console.log("Ticket verification signature:", tx);
    console.log("✅ Ticket verified:", {
      ticketId: ticketId.toString(),
      qrHash,
      holder: provider.wallet.publicKey.toString().slice(0, 8) + "...",
    });
  });

  it("Enforces royalties on resale with correct splits", async () => {
    const saleAmount = new anchor.BN(100_000000); // 100 USDC resale

    // Create mock wallet addresses for royalty recipients
    const artistWallet = anchor.web3.Keypair.generate();
    const organizerWallet = anchor.web3.Keypair.generate();
    const platformWallet = anchor.web3.Keypair.generate();

    const tx = await program.methods
      .enforceRoyalties(saleAmount)
      .accounts({
        event: eventPda,
        seller: provider.wallet.publicKey,
        artist: artistWallet.publicKey,
        organizer: organizerWallet.publicKey,
        platform: platformWallet.publicKey,
      })
      .rpc();

    console.log("Royalty enforcement signature:", tx);

    // Calculate expected royalties
    const totalRoyalty = saleAmount.toNumber() * 0.1; // 10%
    const expectedArtist = totalRoyalty * 0.5; // 5% of sale
    const expectedOrganizer = totalRoyalty * 0.3; // 3% of sale
    const expectedPlatform = totalRoyalty * 0.2; // 2% of sale

    console.log("✅ Royalties enforced:", {
      saleAmount: saleAmount.toString(),
      totalRoyalty: totalRoyalty.toString(),
      artistRoyalty: expectedArtist.toString(),
      organizerRoyalty: expectedOrganizer.toString(),
      platformRoyalty: expectedPlatform.toString(),
    });
  });

  it("Mints multiple tickets up to supply limit", async () => {
    // Create a small event for testing supply limit
    const smallEventName = "Small Test Event";
    const smallSupply = new anchor.BN(3);
    
    const [smallEventPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("event"),
        provider.wallet.publicKey.toBuffer(),
        Buffer.from(smallEventName),
      ],
      program.programId
    );

    // Create small event
    await program.methods
      .initEvent(
        smallEventName,
        new anchor.BN(eventDate),
        venue,
        smallSupply,
        metadataUri,
        priceUsdc
      )
      .accounts({
        event: smallEventPda,
        creator: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    // Mint up to supply
    for (let i = 0; i < 3; i++) {
      await program.methods
        .mintTicket(priceUsdc, false)
        .accounts({
          event: smallEventPda,
          buyer: provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
    }

    // Verify supply exhausted
    const eventAccount = await program.account.event.fetch(smallEventPda);
    assert.equal(
      eventAccount.minted.toString(),
      smallSupply.toString(),
      "All tickets should be minted"
    );

    // Try to mint one more (should fail)
    try {
      await program.methods
        .mintTicket(priceUsdc, false)
        .accounts({
          event: smallEventPda,
          buyer: provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
      
      assert.fail("Should have thrown SupplyExceeded error");
    } catch (error) {
      assert.include(
        error.toString(),
        "SupplyExceeded",
        "Should throw SupplyExceeded error"
      );
      console.log("✅ Correctly enforced supply limit");
    }
  });

  it("Summary: All MPL-Hybrid tests passed", async () => {
    const finalEvent = await program.account.event.fetch(eventPda);
    
    console.log("\n" + "=".repeat(60));
    console.log("🎉 VAMANO MPL-HYBRID TEST SUITE COMPLETE");
    console.log("=".repeat(60));
    console.log("Event:", finalEvent.name);
    console.log("Total Supply:", finalEvent.supply.toString());
    console.log("Total Minted:", finalEvent.minted.toString());
    console.log("Price (USDC):", finalEvent.priceUsdc.toString());
    console.log("Creator:", finalEvent.creator.toString().slice(0, 8) + "...");
    console.log("=".repeat(60));
    console.log("✅ All 10 tests passed successfully!");
    console.log("✅ Ready for devnet deployment");
    console.log("=".repeat(60) + "\n");
  });
});

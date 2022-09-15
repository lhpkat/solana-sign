import React, { useEffect } from "react";
import { WalletContextState } from '@solana/wallet-adapter-react';
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import { Buffer } from "buffer";

const transferNativeSol = async ({
    toPubkey,
    amount,
    payerPublicKey,
    connection,
    wallet,
}) => {
    if (!payerPublicKey) {
      return console.error('error not connect wallet');
    }
    const instructions = [];
    instructions.push(
      SystemProgram.transfer({
        fromPubkey: payerPublicKey,
        lamports: amount,
        toPubkey,
      }),
    );
    const transaction = new Transaction();

    instructions.forEach(instruction => {
      transaction.add(instruction);
    });
    transaction.recentBlockhash = (
      await connection.getRecentBlockhash('max')
    ).blockhash;
    transaction.feePayer = payerPublicKey;

    const signedTransaction = await wallet.signTransaction(transaction);
    const hash = await connection.sendRawTransaction(
      signedTransaction.serialize(),
    );

    return hash;
};

const Test = () => {
    window.Buffer = Buffer;
    const solana = (window).solana;
    const connection = new Connection(clusterApiUrl('devnet'), 'recent');
  
    const toPubkey = new PublicKey(
      'AH8Tm561GniFQjGpVhuEHuaiEXmMJbxc2Efd96HSYYe'
    );
    const amount = 2;

    useEffect(() => {
        window.test = async () => {
            console.log({
                payerPublicKey: solana.publicKey,
                toPubkey,
                amount: amount * 1e9,
                connection,
                wallet: solana,
            });
            transferNativeSol({
                payerPublicKey: solana.publicKey,
                toPubkey,
                amount: amount * 1e9,
                connection,
                wallet: solana,
            });
        };
    }, [])

    return (
        <div>
            test
            <button onClick={ async() => {
                const res = await transferNativeSol({
                    payerPublicKey: solana.publicKey,
                    // payerPublicKey: "C87rP9mA4qNmjZycnT2LhWZ6NXkcGYWHqX68qNmYVyCS",
                    toPubkey,
                    amount: amount * 1e9,
                    connection,
                    wallet: solana,
                })
                console.log({res});
            } }>发送</button>
        </div>
    )
}

export default Test;

import React, { useState, useEffect, useCallback } from 'react';
import { Connection, PublicKey, clusterApiUrl, SystemProgram } from '@solana/web3.js';
import { Program, AnchorProvider, web3, BN } from '@project-serum/anchor';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

// Set up the Solana connection
const connection = new Connection(clusterApiUrl('devnet'));

// Your program ID
const programId = new PublicKey("6XPBWp3kwsbVW5o1BBKjZQfbj8fcdgQJgNxHazxoZ3cm");

// Constants from your Anchor program
const ENTROPY_ACCOUNT_ADDRESS = new PublicKey("CTyyJKQHo6JhtVYBaXcota9NozebV3vHF872S8ag2TUS");
const FEE_ACCOUNT_ADDRESS = new PublicKey("WjtcArL5m5peH8ZmAdTtyFF9qjyNxjQ2qp4Gz1YEQdy");
const RNG_PROGRAM_ADDRESS = new PublicKey("FEED1qspts3SRuoEyG29NMNpsTKX8yG9NGMinNC4GeYB");

// Minimal program interface
const programInterface = {
    "version": "0.1.0",
    "name": "coin_flip",
    "instructions": [
        {
            "name": "getRandom",
            "accounts": [
                {
                    "name": "signer",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "entropyAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "feeAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "rngProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "creditsAccount",
                    "isMut": true,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "playersDecision",
                    "type": {
                        "defined": "PlayersDecision"
                    }
                }
            ]
        }
    ],
    "accounts": [],
    "types": [
        {
            "name": "PlayersDecision",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "decision",
                        "type": "u64"
                    }
                ]
            }
        }
    ],
    "errors": [
        {
            "code": 6000,
            "name": "FailedToGetRandomNumber",
            "msg": "Failed to get random number."
        },
        {
            "code": 6001,
            "name": "InvalidDecision",
            "msg": "The decision is invalid."
        }
    ]
};

export const SolCoinFlip = () => {
    const [wallet, setWallet] = useState(null);
    const [program, setProgram] = useState(null);
    const [balance, setBalance] = useState(0);
    const [result, setResult] = useState(null);
    const [isFlipping, setIsFlipping] = useState(false);
    const { toast } = useToast();

    const updateBalance = useCallback(async (publicKey) => {
        try {
            const balance = await connection.getBalance(publicKey);
            setBalance(balance / web3.LAMPORTS_PER_SOL);
        } catch (error) {
            console.error('Failed to fetch balance:', error);
        }
    }, []);

    useEffect(() => {
        const initializeWallet = async () => {
            if (typeof window !== 'undefined' && window.solana) {
                const solanaWallet = window.solana;
                try {
                    await solanaWallet.connect();
                    setWallet(solanaWallet);
                    const provider = new AnchorProvider(connection, solanaWallet, AnchorProvider.defaultOptions());
                    const program = new Program(programInterface, programId, provider);
                    setProgram(program);
                    updateBalance(solanaWallet.publicKey);
                } catch (error) {
                    console.error('Failed to connect wallet:', error);
                    toast({
                        title: "Wallet Connection Failed",
                        description: "Please make sure your Solana wallet is installed and unlocked.",
                        variant: "destructive",
                    });
                }
            } else {
                toast({
                    title: "Wallet not found",
                    description: "Please install a Solana wallet extension",
                    variant: "destructive",
                });
            }
        };

        initializeWallet();
    }, [updateBalance, toast]);

    const flipCoin = async (decision) => {
        if (!program || !wallet) return;

        setIsFlipping(true);
        setResult(null);

        try {
            const [creditsAccount] = await PublicKey.findProgramAddress(
                [wallet.publicKey.toBuffer(), RNG_PROGRAM_ADDRESS.toBuffer()],
                programId
            );

            const tx = await program.methods.getRandom({
                decision: new BN(decision)
            })
                .accounts({
                    signer: wallet.publicKey,
                    entropyAccount: ENTROPY_ACCOUNT_ADDRESS,
                    feeAccount: FEE_ACCOUNT_ADDRESS,
                    rngProgram: RNG_PROGRAM_ADDRESS,
                    systemProgram: SystemProgram.programId,
                    creditsAccount: creditsAccount,
                })
                .rpc();

            const txResult = await connection.confirmTransaction(tx);

            if (txResult.value.err) {
                throw new Error('Transaction failed');
            }

            // In a real scenario, you'd fetch the game state to determine the result
            // For now, we'll just use a random result
            const randomResult = Math.random() < 0.5 ? 'Heads' : 'Tails';
            setResult(randomResult);
            updateBalance(wallet.publicKey);

            toast({
                title: "Coin flipped!",
                description: `You chose ${decision === 0 ? 'Heads' : 'Tails'}. Result: ${randomResult}`,
            });
        } catch (error) {
            console.error('Error:', error);
            toast({
                title: "Error",
                description: "Failed to flip the coin. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsFlipping(false);
        }
    };

    return (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>Sol Coin Flip</CardTitle>
                <CardDescription>Try your luck on the Solana blockchain!</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-bold text-center mb-4">
                    {result ? result : 'Ready to flip?'}
                </p>
                <p className="text-sm text-muted-foreground text-center">
                    Balance: {balance.toFixed(4)} SOL
                </p>
            </CardContent>
            <CardFooter className="flex justify-center gap-4">
                <Button onClick={() => flipCoin(0)} disabled={isFlipping || !wallet}>
                    {isFlipping ? 'Flipping...' : 'Flip Heads'}
                </Button>
                <Button onClick={() => flipCoin(1)} disabled={isFlipping || !wallet}>
                    {isFlipping ? 'Flipping...' : 'Flip Tails'}
                </Button>
            </CardFooter>
        </Card>
    );
};


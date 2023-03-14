import TransportWebHid from '@ledgerhq/hw-transport-webhid';
import {
  getPublicKey,
  domichain_derivation_path,
  domichain_ledger_sign_bytes,
  domichain_ledger_sign_transaction,
  domichain_ledger_confirm_public_key,
} from './ledger-core';
import { DERIVATION_PATH } from './localStorage';
import bs58 from 'bs58';

let TRANSPORT = null;

export class LedgerWalletProvider {
  constructor(args) {
    this.onDisconnect = (args && args.onDisconnect) || (() => {});
    this.derivationPath = args
      ? args.derivationPath
      : DERIVATION_PATH.bip44Change;
    this.account = args ? args.account : undefined;
    this.change = args ? args.change : undefined;
    this.domiDerivationPath = domichain_derivation_path(
      this.account,
      this.change,
      this.derivationPath,
    );
  }

  init = async () => {
    if (TRANSPORT === null) {
      TRANSPORT = await TransportWebHid.create();
    }
    this.transport = TRANSPORT;
    this.pubKey = await getPublicKey(this.transport, this.domiDerivationPath);
    this.transport.on('disconnect', this.onDisconnect);
    this.listAddresses = async (walletCount) => {
      // TODO: read accounts from ledger
      return [this.pubKey];
    };
    return this;
  };

  get publicKey() {
    return this.pubKey;
  }

  signTransaction = async (transaction) => {
    const sig_bytes = await domichain_ledger_sign_transaction(
      this.transport,
      this.domiDerivationPath,
      transaction,
    );
    transaction.addSignature(this.publicKey, sig_bytes);
    return transaction;
  };

  createSignature = async (message) => {
    const sig_bytes = await domichain_ledger_sign_bytes(
      this.transport,
      this.domiDerivationPath,
      message,
    );
    return bs58.encode(sig_bytes);
  };

  confirmPublicKey = async () => {
    return await domichain_ledger_confirm_public_key(
      this.transport,
      this.domiDerivationPath,
    );
  };
}

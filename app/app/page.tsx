import styles from './page.module.css'

import { Provider } from 'starknet';
import { decodeShortString } from 'starknet/dist/utils/shortString';
import { gunzipSync } from 'fflate';

const provider = new Provider(); // goerli-alpha

function arrToString(arr: string[]): string {
  return arr.slice(1, arr.length).map(decodeShortString).join('');
}

function decodeOnchainJS(data: string[]): string {
  const jsDataCompressed = arrToString(data)
  const jsBytes = new Uint8Array(Buffer.from(jsDataCompressed, 'base64'))
  const jsData = gunzipSync(jsBytes)
  const jsCode = new TextDecoder().decode(jsData);
  return jsCode;
}

async function getP5() {
  const contractData = await provider.callContract({ contractAddress: "0x4cd1b9b78b42d9f4b30abab92e8616ca34596f10ae5131f6cd3d913767c71e5", entrypoint: "get_p5js" })
  return decodeOnchainJS(contractData.result);
}

async function getSNLogo() {
  const contractData = await provider.callContract({ contractAddress: "0x4c8c96e96ccf04a0fcadad1bc259e52bd5c220c0cbbc9cc9c17109d4e5dd312", entrypoint: "get_snlogojs" })
  return decodeOnchainJS(contractData.result);
}

export default async function Home() {
  const p5JS = await getP5();
  const SNLogo = await getSNLogo();

  return (
    <div className={styles.container}>
      <script defer type="text/javascript" src={p5JS}></script>
      <script defer type="text/javascript" src={SNLogo}></script>
    </div>
  )
}

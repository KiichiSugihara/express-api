// https://docs.microsoft.com/ja-jp/azure/storage/blobs/storage-quickstart-blobs-nodejs-v10
// Azure BLOB ストレージの名前空間からクラスと関数をインポート
const {
  Aborter,
  BlockBlobURL,
  ContainerURL,
  ServiceURL,
  SharedKeyCredential,
  StorageURL,
  uploadStreamToBlockBlob,
  uploadFileToBlockBlob
} = require('@azure/storage-blob');

const fs = require('fs');
const path = require('path');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const STORAGE_ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const ACCOUNT_ACCESS_KEY = process.env.AZURE_STORAGE_ACCOUNT_ACCESS_KEY;

// ファイルサイズ計算定数
const ONE_MEGABYTE = 1024 * 1024;
const FOUR_MEGABYTES = 4 * ONE_MEGABYTE;
const ONE_MINUTE = 60 * 1000;

async function showContainerNames(aborter, serviceURL) {
  let marker = undefined;

  do {
    const listContainersResponse = await serviceURL.listContainersSegment(
      aborter,
      marker
    );
    marker = listContainersResponse.nextMarker;
    for (let container of listContainersResponse.containerItems) {
      console.log(` - ${container.name}`);
    }
  } while (marker);
}

async function uploadLocalFile(aborter, containerURL, filePath) {
  filePath = path.resolve(filePath);

  const fileName = path.basename(filePath);
  const blockBlobURL = BlockBlobURL.fromContainerURL(containerURL, fileName);

  return await uploadFileToBlockBlob(aborter, filePath, blockBlobURL);
}

async function uploadStream(aborter, containerURL, filePath) {
  filePath = path.resolve(filePath);

  const fileName = path.basename(filePath).replace('.md', '-stream.md');
  const blockBlobURL = BlockBlobURL.fromContainerURL(containerURL, fileName);

  const stream = fs.createReadStream(filePath, {
    highWaterMark: FOUR_MEGABYTES
  });

  const uploadOptions = {
    bufferSize: FOUR_MEGABYTES,
    maxBuffers: 5
  };

  return await uploadStreamToBlockBlob(
    aborter,
    stream,
    blockBlobURL,
    uploadOptions.bufferSize,
    uploadOptions.maxBuffers
  );
}

async function showBlobNames(aborter, containerURL) {
  let marker = undefined;

  do {
    const listBlobsResponse = await containerURL.listBlobFlatSegment(
      Aborter.none,
      marker
    );
    marker = listBlobsResponse.nextMarker;
    for (const blob of listBlobsResponse.segment.blobItems) {
      console.log(` - ${blob.name}`);
    }
  } while (marker);
}

// A helper method used to read a Node.js readable stream into string
async function streamToString(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on('data', data => {
      chunks.push(data.toString());
    });
    readableStream.on('end', () => {
      resolve(chunks.join(''));
    });
    readableStream.on('error', reject);
  });
}
// async/awaitのための呼び出し関数
async function execute() {
  //変数宣言 ここらを引数にして渡したり
  const containerName = 'demo';
  const blobName = 'quickstart.txt';
  const content = 'hello!';
  const localFilePath = './readme.md';

  //   認証確認
  const credentials = new SharedKeyCredential(
    STORAGE_ACCOUNT_NAME,
    ACCOUNT_ACCESS_KEY
  );
  const pipeline = StorageURL.newPipeline(credentials);
  const serviceURL = new ServiceURL(
    `https://${STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
    pipeline
  );

  //   コンテナ(箱)とBlob(データ)のurl
  const containerURL = ContainerURL.fromServiceURL(serviceURL, containerName);
  const blockBlobURL = BlockBlobURL.fromContainerURL(containerURL, blobName);

  const aborter = Aborter.timeout(30 * ONE_MINUTE);

  //   コンテナ作成
  await containerURL.create(aborter);
  console.log(`Container: "${containerName}" is created`);
  // コンテナのURL表示
  console.log('Containers:');
  await showContainerNames(aborter, serviceURL);

  //   Blobにテキストをアップロード
  await blockBlobURL.upload(aborter, content, content.length);
  console.log(`Blob "${blobName}" is uploaded`);
  // ローカルファイルで渡すなら、ファイルのパス必要
  await uploadLocalFile(aborter, containerURL, localFilePath);
  console.log(`Local file "${localFilePath}" is uploaded`);
  // ストリームとは？
  await uploadStream(aborter, containerURL, localFilePath);
  console.log(`Local file "${localFilePath}" is uploaded as a stream`);
  // あるコンテナの中のblobName取ってくる(ダウンロードするデータの選択肢表示とか)
  console.log(`Blobs in "${containerName}" container:`);
  await showBlobNames(aborter, containerURL);
  // 存在するBlobをdownload メソッドを使用して内容をダウンロード
  const downloadResponse = await blockBlobURL.download(aborter, 0);
  //   応答はストリームで返される
  const downloadedContent = await streamToString(
    downloadResponse.readableStreamBody
  );
  console.log(`Downloaded blob content: "${downloadedContent}"`);

  await blockBlobURL.delete(aborter);
  console.log(`Block blob "${blobName}" is deleted`);

  await containerURL.delete(aborter);
  console.log(`Container "${containerName}" is deleted`);
}

execute()
  .then(() => console.log('Done'))
  .catch(e => console.log(e));

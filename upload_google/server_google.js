const express = require('express');
const fileUpload = require('express-fileupload');
const { Storage } = require("@google-cloud/storage")

//Configuramos Cliente Google Storage
const storage = new Storage({
    projectId: "refined-graph-300511",
    keyFilename : "./refined-graph-300511-0d3228a67fe7.json"
    // credentials: {
    //   client_email: "nwo-sc-bucket@refined-graph-300511.iam.gserviceaccount.com",
    //   private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC+B6dSjFe5645Z\n1wbbWSMDFiH5Njqw7Z3wR6wALJon42XLOX/mz+O0ZAtxZuUwzKi//Wo6wt/q4idd\np8IPI8mcqlj2T2tSfSTFJuJOEaIx8wPVsgtMErFYOQss2NhiYBVE7DPZzbU3kgC3\nxCFzqcZ/kvpJ4rlHKA5h33QeD4jjQuc5Vf9dXC+iAFDeyW5YPGNMHKUWR/qH1pzl\ntDcKCSK69Ed4OLlVkRdWDltoMF7jE5p7GKxlQN7JDWKiIqcf4JiY6Uu2mlsLhRCG\nB3GCa7zv4mY1OmEUAYXss+KUF0E9rXONoO5sQF7wbdyG+J/g8zwVMAxS6PekrSJM\nO/PtyJTHAgMBAAECggEACbUyYxEwWhsihoxpmUMQetPioGyYyvkYnHHM46Vjqq3/\nQUaKtivgohKKUxzCkJ+j70ru5lmWPtWW1T4At+1IG2zIZqzf+rLR8hBudzaHZq3X\ngE88LIK39J3VaFEbnMrzyzWV4IaVv2UCDGFEpDgEH/hOOQAQHwZ41Z8ou3BnudRW\nk8FGiboCiO8zDjpo1j3vDqUSQU42WmyRG2mIHeXMRuKriNyudXYmXbdxXlkdrSq5\nJ4SAegqlX+vsHMrKYaNfCGbvvTCEdkCmTYhY1TQzk+78bly8fgsnGOGkClN8MgLF\nKpFI2DhZPs5EVBnpWLuRgJ5kX+Bj9H5RR7PsS25coQKBgQDnibkFLEx5w7vS3wKm\nchczoxPks+N8fZvnPAODpTa46q2Iu1VVQRLMRQIn+cF9zAty5CJJR/Z/c7m5F8aO\ntHnwuoMyJ26rryja67iwMH/J/DXsgVwLtfI2AKRwJzKkeMa3qLnlpRrZYunNgrTN\ntASZvMwLkoUOptnTQJjJLcNhtQKBgQDSG0j/d6v7YLwU+2Hrolbw6nonlNKgPzmF\npTTdpTX0noCsHdPYJAucbxzJeAfN89P7YBaAlnnTDkT6iYasHUYvEtrs5RiYhAlH\nyYMuZDGfv8nPPRuXhnWvpuF/lGJueIRP00gI9/30VjGLUXmKZ0fFz2BBuZpddFK2\n4aSySvsaCwKBgGbX/7zSfm2fiXAS6qRwDOo8x3tQg/0p9fPx7kWtPu9IHiibvT2P\nGABvrpN/FnkABx3TQ391XYIjLx2N9/4vH/LTha7jYP8VYHpNNc3c3QYk5vbURsRU\n3u8pveCrKI1xsCKn6VqdyZ1BmERWiGTOTzTSbXe+byeg6SQyjyrdDun5AoGAav6W\nF/J7VFIYtZ6maPaMy7a8ajexYwWPZ22QFGczqNSmtf+ih+kjOJCk2jwTzV+jzdlK\n3ETE2SPlIKi0OiXWPdaeQhEQi2qBx1rpQNCpLK7gOHbn/Cvu9npHT07jKVqaFoSD\npH2Vh731EPt2p3Kc7DEE1bOM1paMILGby2e/o60CgYACyY036hZ6zBDbHJRlWYwK\nKIluez3rAEkmZadbFoQzswtjxF3WOS7GW+5kiAu9m3Fgsyzr1AuviUlGaUCSL4Se\nTrdHw7cAgb+GagP/g0ssZR9STH6PCelcrfuN/ShNJfofv5H6OQ7I87d7Gc/Kn7dm\nfzNed8E0/sYn8jKbABXMng==\n-----END PRIVATE KEY-----\n"
    // }
  });


const bucket = storage.bucket("nwo-bucket1")

//////////// EXPRESS//////////////////
const app = express(); // Expresss Raiz 

app.use(fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 },
  abortOnLimit: true,
  useTempFiles: true
}));



app.post('/upload', async (req, res) => {
  
    let file = req.files.myFile;
    console.log(file);
    
    let rpta= await bucket.upload(file.tempFilePath, {
        destination: file.name,
    });
  
    console.log(rpta);

      res.send({
        status: true,
        // rpta
        file: rpta[0].metadata.mediaLink
      });

  
    
  });
  


app.listen(4500, () => {
    console.log('Server express-fileupload Ok PORT 4500');
  
});


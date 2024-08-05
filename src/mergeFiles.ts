import * as fs from "fs";
import * as path from "path";

function mergeTxtFiles(directoryPath: string, outputFilePath: string) {
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      return;
    }

    const txtFiles = files.filter((file) => file.endsWith(".txt"));
    const writeStream = fs.createWriteStream(outputFilePath);

    txtFiles.forEach((file, index) => {
      const filePath = path.join(directoryPath, file);
      const fileContents = fs.readFileSync(filePath, "utf8");

      // 파일 제목 추가
      writeStream.write(`${file}\n\n\n`);
      writeStream.write(fileContents);

      if (index < txtFiles.length - 1) {
        writeStream.write("\n\n\n\n\n\n"); // 각 파일의 내용 사이에 두 줄의 공백 추가
        writeStream.write("---\n\n\n\n");
      }
    });

    writeStream.end();
    console.log(`All files have been merged into ${outputFilePath}`);
  });
}

function getCurrentDateFormatted(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const date = getCurrentDateFormatted();

// 디렉터리 경로와 출력 파일 경로 설정
const directoryPath = path.join(__dirname);
const outputFilePath = path.join(__dirname, `${date}일일보고서.txt`);

// 병합 함수 실행
mergeTxtFiles(directoryPath, outputFilePath);

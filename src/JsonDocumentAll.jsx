import { useState } from "react";
import * as XLSX from "xlsx";
import GroupComponent from "./GroupComponent";

class Para {
  constructor() {
    this.number = "";
    this.name = "";
    this.disciplina = "";
    this.prepod = "";
    this.kab = "";
  }
}

class Day {
  constructor() {
    this.date = "";
    this.pars = [];
  }
}

function App() {
  const [excelFile, setExcelFile] = useState(null);
  const [typeError, setTypeError] = useState(null);
  const [groups, setGroups] = useState([]);
  const [jsonData, setJsonData] = useState(null); // Добавляем состояние для хранения JSON

  const handleFile = (e) => {
    let fileTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
    ];
    let selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile && fileTypes.includes(selectedFile.type)) {
        setTypeError(null);
        let reader = new FileReader();
        reader.readAsArrayBuffer(selectedFile);
        reader.onload = (e) => {
          setExcelFile(e.target.result);
        };
      } else {
        setTypeError("Пожалуста выбирайте только файлы типа excel");
        setExcelFile(null);
      }
    } else {
      console.log("Пожалуйста выбирите файл");
    }
  };

  const handleFileSubmit = (e) => {
    e.preventDefault();
    if (excelFile !== null) {
      const workbook = XLSX.read(excelFile, { type: "buffer" });
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];

      const groupRanges =
        worksheet["!merges"]?.filter((x) => x["s"]["r"] === 0) || [];
      let allJsonData = [];

      groupRanges.forEach((groupRange) => {
        // Определяем столбцы группы
        const startCol = groupRange.s.c; // Начальный столбец группы
        const endCol = groupRange.e.c + 5; // Конечный столбец группы (захватываем дополнительные столбцы)
        console.log("startCol", startCol, "endCol", endCol);
        // Создаем новый worksheet, содержащий только нужные строки и столбцы
        const newWorksheet = {};
        const startRow = 1; // Начинаем со второй строки (индекс 1)
        const endRow = 50;
        for (let R = startRow; R <= endRow; ++R) {
          for (let C = startCol; C <= endCol; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ c: C, r: R });
            const cell = worksheet[cellAddress];
            if (cell) {
              newWorksheet[cellAddress] = cell;
            }
          }
        }

        // Копируем !merges
        newWorksheet["!merges"] = worksheet["!merges"];

        // Определяем диапазон
        const range = {
          s: { c: startCol, r: startRow },
          e: { c: endCol, r: endRow },
        };
        newWorksheet["!ref"] = XLSX.utils.encode_range(range);

        // Преобразуем новый worksheet в JSON
        const data = XLSX.utils.sheet_to_json(newWorksheet, { header: 1 });
        allJsonData.push(data);
      });

      setJsonData(JSON.stringify(allJsonData, null, 2));
      console.log("JSON Data:", JSON.stringify(allJsonData, null, 2));

      //display all groups
      console.log(worksheet["!merges"].filter((x) => x["s"]["r"] === 0));
      setJsonData(JSON.stringify(allJsonData, null, 2));
      console.log("JSON Data:", JSON.stringify(allJsonData, null, 2));
    }
  };

  const findDayRanges = (groupColumn, worksheet) => {
    const mergedRanges = worksheet["!merges"];
    if (!mergedRanges) return [];

    const dayRanges = [];
    mergedRanges.forEach((range) => {
      if (range.s.c === groupColumn && range.s.r > 0) {
        dayRanges.push(range);
      }
    });
    return dayRanges;
  };

  const scanPara = (worksheet, dayRange) => {
    const paras = [];
    for (let row = dayRange.s.r; row <= dayRange.e.r; row++) {
      const para = new Para();
      para.number =
        worksheet[XLSX.utils.encode_cell({ r: row, c: dayRange.s.c + 1 })]?.v ||
        "";
      para.name =
        worksheet[XLSX.utils.encode_cell({ r: row, c: dayRange.s.c + 2 })]?.v ||
        "";
      para.disciplina =
        worksheet[XLSX.utils.encode_cell({ r: row, c: dayRange.s.c + 3 })]?.v ||
        "";
      para.prepod =
        worksheet[XLSX.utils.encode_cell({ r: row, c: dayRange.s.c + 4 })]?.v ||
        "";
      para.kab =
        worksheet[XLSX.utils.encode_cell({ r: row, c: dayRange.s.c + 5 })]?.v ||
        "";

      if (para.number || para.disciplina || para.prepod) {
        paras.push(para);
      }
    }
    return paras;
  };

  const scanDay = (worksheet, dayRangeList) => {
    const days = [];
    dayRangeList.forEach((dayRange) => {
      const day = new Day();
      day.date =
        worksheet[XLSX.utils.encode_cell({ r: dayRange.s.r, c: dayRange.s.c })]
          ?.v || "";
      day.pars = scanPara(worksheet, dayRange);
      days.push(day);
    });
    return days;
  };

  return (
    <div className="wrapper">
      <h3>Загрузка и отображение</h3>

      <form className="form-group custom-form" onSubmit={handleFileSubmit}>
        <input
          type="file"
          className="form-control"
          required
          onChange={handleFile}
        />
        <button type="submit" className="btn btn-success btn-md">
          ЗАГРУЗИТЬ
        </button>
        {typeError && (
          <div className="alert alert-danger" role="alert">
            {typeError}
          </div>
        )}
      </form>

      {/* Отображение JSON */}
      {jsonData && (
        <div className="json-viewer">
          <h4>JSON Data:</h4>
          <pre>{jsonData}</pre>
        </div>
      )}

      <div className="viewer">
        {groups.length > 0 && (
          <div>
            {groups.map((group, index) => (
              <GroupComponent key={index} group={group} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
export default App;

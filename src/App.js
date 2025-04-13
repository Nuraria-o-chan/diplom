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
  const [dataRange, setDataRange] = useState([]);
  const [groups, setGroups] = useState([]);

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

      //display all groups
      console.log(worksheet["!merges"].filter((x) => x["s"]["r"] === 0));

      const data = XLSX.utils.sheet_to_json(worksheet);
      const mergedRange = worksheet["!merges"].filter(
        (x) => x["s"]["r"] === 0
      )[15];

      // Find first merged range that starts on row 0
      // const mergedRange = worksheet["!merges"]?.find((x) => x["s"]["r"] === 0);

      if (!mergedRange) {
        console.warn("No merged range found starting on row 0.");
        return;
      }

      var dataRangeValues = [];

      /* Iterate through each element in the structure */
      for (var R = mergedRange.s.r + 2; R <= mergedRange.e.r + 50; ++R) {
        var cellNumber = { c: mergedRange.s.c + 1, r: R };
        var para = new Para();
        var dataRa = XLSX.utils.encode_cell(cellNumber);

        // Check if cell exists before accessing its value
        para.number = worksheet[dataRa]?.v || "";
        cellNumber = { c: mergedRange.s.c + 3, r: R };
        dataRa = XLSX.utils.encode_cell(cellNumber);

        // Check if cell exists before accessing its value
        para.name = worksheet[dataRa]?.v || "";
        cellNumber = { c: mergedRange.s.c + 2, r: R };
        dataRa = XLSX.utils.encode_cell(cellNumber);

        // Check if cell exists before accessing its value
        para.disciplina = worksheet[dataRa]?.v || "";
        cellNumber = { c: mergedRange.s.c + 4, r: R };
        dataRa = XLSX.utils.encode_cell(cellNumber);

        // Check if cell exists before accessing its value
        para.prepod = worksheet[dataRa]?.v || "";
        cellNumber = { c: mergedRange.s.c + 5, r: R };
        dataRa = XLSX.utils.encode_cell(cellNumber);

        // Check if cell exists before accessing its value
        para.kab = worksheet[dataRa]?.v || "";
        dataRangeValues.push(para);
      }

      const groupName =
        worksheet[
          XLSX.utils.encode_cell({ r: mergedRange.s.r, c: mergedRange.s.c })
        ]?.v?.toString() || "Без названия";

      const groupColumn = mergedRange.s.c; // Столбец группы
      const dayRangeList = findDayRanges(groupColumn + 1, worksheet);

      // Создаем объект Group
      const newGroup = {
        Name: groupName,
        paras: dataRangeValues,
      };

      // Устанавливаем состояние groups
      setGroups([newGroup]); //  Заменяем setDataRange  на setGroups
      console.log(newGroup);

      setDataRange(dataRangeValues); // Обновляем состояние dataRangeValues
      console.log(dataRangeValues);
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

      <div className="viewer">
        {groups.length > 0 && ( // Отображаем группы, если они есть
          <div>
            {groups.map(
              (
                group,
                index // Итерируемся по группам
              ) => (
                <GroupComponent key={index} group={group} /> // Отображаем компонент GroupComponent для каждой группы
              )
            )}
          </div>
        )}
        {dataRange.length > 0 && (
          <div>
            <h4>Data Range:</h4>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Номер</th>
                  <th>Дисциплина</th>
                  <th>Преподаватель</th>
                  <th>Кабинет</th>
                </tr>
              </thead>
              <tbody>
                {dataRange.map((para, index) => (
                  <tr key={index}>
                    <td>{para.number}</td>
                    <td>{para.name}</td>
                    <td>{para.disciplina}</td>
                    <td>{para.prepod}</td>
                    <td>{para.kab}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
export default App;

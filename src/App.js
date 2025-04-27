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

      function getLastUsedRow(worksheet) {
        if (!worksheet || !worksheet["!ref"]) return 0;
        const range = XLSX.utils.decode_range(worksheet["!ref"]);
        return range.e.r + 1;
      }

      const mergedRanges =
        worksheet["!merges"]?.filter((x) => x["s"]["r"] === 0) || [];

      if (!mergedRanges || mergedRanges.length === 0) {
        console.warn("No merged ranges found starting on row 0.");
        return;
      }

      const allGroups = []; // Array to store all Group objects

      mergedRanges.forEach((mergedRange) => {
        const dataRangeValues = []; // Array to store data for *this* group

        // Get the Group Name (Date) -  assuming the merged cell is used as a header
        const groupName =
          worksheet[
            XLSX.utils.encode_cell({ r: mergedRange.s.r, c: mergedRange.s.c })
          ]?.v?.toString() || "Без названия";

        // Loop through the rows *within* this merged range
        for (let R = mergedRange.s.r + 2; R <= getLastUsedRow(worksheet); ++R) {
          // Adjusted starting row
          const para = new Para();
          // Extract values for the current 'para'
          para.number =
            worksheet[XLSX.utils.encode_cell({ r: R, c: mergedRange.s.c + 1 })]
              ?.v || "";
          para.name =
            worksheet[XLSX.utils.encode_cell({ r: R, c: mergedRange.s.c + 2 })]
              ?.v || "";
          para.disciplina =
            worksheet[XLSX.utils.encode_cell({ r: R, c: mergedRange.s.c + 3 })]
              ?.v || "";
          para.prepod =
            worksheet[XLSX.utils.encode_cell({ r: R, c: mergedRange.s.c + 4 })]
              ?.v || "";
          para.kab =
            worksheet[XLSX.utils.encode_cell({ r: R, c: mergedRange.s.c + 5 })]
              ?.v || "";
          dataRangeValues.push(para); // Add the 'para' to this group's data
        }

        // Create a Group object and push it to the allGroups array
        const newGroup = {
          Name: groupName,
          paras: dataRangeValues, // Contains all 'para' data for the group
        };
        allGroups.push(newGroup);
      });
      // Update the state with all the extracted groups
      setGroups(allGroups);
      // Optional: set dataRange if needed, if you want all 'paras' in a single array
      setDataRange(allGroups.flatMap((group) => group.paras));

      console.log("All groups:", allGroups);
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

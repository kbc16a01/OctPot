// キャラクターを作成する処理
// 作成画面をhymlで
// 基本フロー3,6,9の処理

// 3,アクターは作成するキャラクターPCかNPCかを選択する。
class CharacterCreate {
  private Character;
  constructor() {}

  judge(acter): any {
    if (acter === 'PC') {

    } else　if (acter === 'NPC') {

    } else {
      this.errorlog(acter);
    }
  }
// 1～6の乱数作成。それを3回繰り返したのを合計して返す。(3d6)
// 6,システムはダイスロールの値からをステータスを決める。

  private diceroll(select): number[] {
    let dice: number[] = [3];
    if (select === '3D6') {
      let diceroll: number;
      for (let i = 0; i < 2; i++) {
        diceroll = Math.floor(Math.random() * 6 + 1);
        dice[3] += diceroll;
        dice[i] += diceroll;
      }
      return dice;
   } else if (select === '2D6') {
      for (let i = 0; i < 1; i++) {
        let diceroll = Math.floor(Math.random() * 6 + 1);
        dice[2] += diceroll;
        dice[i] += diceroll;
      }
      return dice;
    } else {
      this.errorlog(select);
      return null;
    }
  }

// 入力されたアクションからダイスの種類を決める
  select(action): any {
    let result = 0;
    let dice: number[];
    switch (action) {
      case 'edu':
        result += 3;
      case 'str':
      case 'con':
      case 'pow':
      case 'dex':
      case 'app':
      case 'income-and-propety':
        dice = this.diceroll('3D6');
        result += dice[3];
        break;
      case 'siz':
      case 'int':
        dice = this.diceroll('2D6');
        result += 3;
        result += dice[2];
        break;
      default:
        this.errorlog(action);
    }
    return dice , result;
  }

// ダイスロールの結果からステータスの値を求める。
  status(status, diceresult, diceresult2) {
    let result = 0;
    switch (status) {
      case 'luck':
      case 'idea':
      case 'knowledge':
        result += diceresult * 5;
        break;
      case 'mp':
        result += diceresult;
        break;
      case 'HobbySkill':
        result += diceroll * 10;
        break;
      case 'VocationalSkill':
        result += diceroll * 20;
        break;
      case 'health':
        result += (diceresult + diceresult2) / 2;
        break;
      default:
        this.errorlog(status);
    }
    return result;
  }


// 9,システムは情報をjson形式で管理用フォルダに保存する。

// jsonに変換
  change(data) {
  // let target = data.target;
  // let file = target.files;
  let jsondata = JSON.stringify(data);
}

// ファイルのダウンロード（保存）
  save(content, filename) {
    let blob = new Blob([ content ], { 'type' : 'text/plain' });
    if (window.navigator.msSaveBlob) {
      window.navigator.msSaveBlob(blob, filename);
    } else {
      document.getElementById('download').href = window.URL.createObjectURL(blob);
    }
  }

  errorlog(e) {
    e.onerror = (msg, url, line, col, error) => {
      switch (e) {
        case null:
        case undefined:
          console.log(msg + ':' + line);
          console.log('引数が見つかりません。');
      }
    };
  }
}

window.onload = (e) => {
  let action = document.getElementById('action');
  action.addEventListener('click', function () {});

  let file = document.getElementById('file');
  file.addEventListener('click', this.save());

}

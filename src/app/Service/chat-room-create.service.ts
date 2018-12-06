import {Injectable} from '@angular/core';
import * as client from 'socket.io-client';
import {BehaviorSubject} from 'rxjs';
@Injectable()
export class ChatRoomCreateService {
  // ホスト側が使うルーム作成クラス
  // ルームを作成、peerを作成、channelを作成
  // こっちでio.onでスタンバっといて入室者側のconnectが来たらoffer投げるようにするか
  // passはあとでいいか
  private peer;
  private io;
  private channel;
  private  id;
  public data = new BehaviorSubject<string>('test');
  constructor() {}
  create(room, pass) {
    console.groupCollapsed('createFunction(service)');
    console.log('constructor', 'from', 'service');
    this.peer = new RTCPeerConnection({iceServers: [{urls: 'stun:stun.l.google.com:19302'}]});
    this.io = client.connect('http://150.95.205.204:80/');
    console.profile('ondatachannel');
    this.dc();
    console.profileEnd();

    console.profile('onicecadidate');
    this.cd();
    console.profileEnd();

    console.profile('connectFunction');
    this.connect(room, pass);
    console.profileEnd();

    console.groupEnd();
  }

  dc() {
    this.channel = this.peer.createDataChannel('my channel');
    this.peer.ondatachannel = (e) => {
      console.groupCollapsed('dcFunction');
      // e.channelにtestが格納されているのでそれを使う
      console.log('ondDataChannel');
      // console.log(e.candidate.candidate.split(' ')[4]); // address
      console.log(this.channel);
      console.groupEnd();
    };
    this.channel.onopen = () => {
      console.log('DataChannelOpen');
    };
    this.channel.onmessage = (event) => {
      console.log('データチャネルメッセージ取得:', event.data);
      console.log(event);
      this.data.next(event.data);
    };
    this.channel.onclose = () => {
      console.log('DataChannelClose');
    };
    this.channel.onerror = (err) => {
      console.log(err);
    };
  }

  cd() {
    this.peer.onicecandidate = (e) => {
      console.groupCollapsed('onicecadidate');
      if (e.candidate) {
        this.io.emit('candidate', {candidate: e.candidate, sdp: this.peer.localDescription.sdp});
      }else {
        console.log('candi  err');
        return;
      }
      console.groupEnd();
    };
  }
  // peer通信を始める準備
  connect(room, pass) {
    console.groupCollapsed('connectFunction');
    console.log('connect service');
    console.profile('sdpFunction');
    this.sdp();
    console.profileEnd();
    this.io.on('connect', (socket) => {
      this.io.emit('create', {room: room, pass: pass});
      this.io.emit('id');
      console.groupCollapsed('ioのconnect');
      console.log('clientSide', 'connect');
      console.groupEnd();
    });
    this.io.on('create', (e) => {
      console.log('create', e);
    });
    this.io.on('hello', (e) => {
      console.log('hello', e);
    });
    this.io.on('enter', (e) => {
      console.log('enter');
      console.log('client: ', e, 'が申請してきました。');
      this.offer(e);
    });
    this.io.on('id', (e) => {
      console.groupCollapsed('ioのid');
      console.log(e);
      this.id = e;
      console.groupEnd();
    });
    console.groupEnd();
  }
  // SDPofferが送られてきたときの処理
  sdp() {
    console.groupCollapsed('sdpFunction');
    console.log('from here socket function');
    // let answer = this.answer;
    this.io.on('SDP', (e) => {
      console.groupCollapsed('ioのSDP');
      console.log('clientSide', 'SDP');
      if (!e.sdp.sdp) {
        console.log('sdp.sdp is not property');
        return;
      }
      if (e.sdp.sdp !== this.peer.localDescription.sdp) {
        console.log('check the sdp');
        var description = new RTCSessionDescription(e.sdp);
        console.log(description);
        this.peer.setRemoteDescription(description, () => {
          console.log('peerDescription');
          console.log('desctype= ', description.type);
          if (description.type === 'offer') {
            console.log('sdp type is offer');
            console.log(this.peer);
            console.profile('answerFunction');
            console.profileEnd();
          }
        });
      }
      console.groupEnd();
    });
    // candidateを受け取る処理
    this.io.on('candidate', (e) => {
      console.groupCollapsed('ioのcandidate');
      if (this.peer.localDescription.sdp !== e.sdp) {
        console.log('candis ok');
        if (e.candidate) {
          var candidate = new RTCIceCandidate(e.candidate);
          this.peer.addIceCandidate(candidate);
        }
      }
      console.groupEnd();
    });
    console.groupEnd();
  }
  // sdpを送る処理
  offer(client) {
    console.groupCollapsed('offerFunction');
    console.log('this from offer');
    this.peer.createOffer( (offer) => {
      this.peer.setLocalDescription(new RTCSessionDescription(offer), () => {
        console.log('HostSide', 'offer');
        console.log(client);
        this.io.emit('offer', {sdp: offer}, {client: client});
      });
    }, function (error) {
      console.log(error);
    });
    console.groupEnd();
    return;
  }
  message(e) {
    var value: string = this.id + ': ' + e;
    this.channel.send(value);
    this.data.next(value);
  }
}

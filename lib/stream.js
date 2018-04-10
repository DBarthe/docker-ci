import shortid from "shortid";

export class StreamPool {
  constructor() {
    this.pool = {}
  }

  create() {
    const key = shortid.generate();

    this.pool[key] = {
      data: {
        output: [],
        complete: false,
        succeed: undefined,
        error: undefined
      },
      peers: [],
    };

    return key;
  }

  join(key, peer) {
    if (!this.pool.hasOwnProperty(key)) {
      peer.sseSend({error: `Invalid key ${key}`});
      return peer.end();
    }
    
    this.recap(key, [ peer ]);
    this.pool[key].peers.push(peer);
  }

  supply(key, { output }) {
    const stream = this.pool[key];
    stream.data.output.push(...output);
    for (let peer of stream.peers) {
      peer.sseSend({ ...stream.data, output: output })
    }
  }

  done(key) {
    this.pool[key].data.complete = true;
    this.pool[key].data.succeed = true;
    this.recap(key);
    this.close(key);
  }

  fail(key, err) {
    this.pool[key].data.complete = true;
    this.pool[key].data.succeed = false;
    this.pool[key].data.error = err;
    this.recap(key);
    this.close(key);
  }

  recap(key, peers=undefined) {
    const stream = this.pool[key];
    peers = peers || stream.peers;

    for (let peer of peers) {
      peer.sseSend(stream.data);
    }
  }

  close(key) {
    for (let peer of this.pool[key].peers) {
      peer.end();
    }
    this.pool[key].peers = [];
  }
}

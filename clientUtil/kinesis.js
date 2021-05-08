import { SignalingClient } from 'amazon-kinesis-video-streams-webrtc';

const ERROR_CODE = {
  OK: 0,
  NO_WEBCAM: 1,
  NOT_MASTER: 2,
  VIEWER_NOT_FOUND: 3,
  LOCAL_STREAM_NOT_FOUND: 4,
  NOT_FOUND_ANY: 5,
  ERROR: 6,
  UNKNOWN_ERROR: 7
};

/**
 * CustomSigner class takes the url in constructor with a getSignedUrl method which returns the signedURL
 */
class CustomSigner {
  constructor (_url) {
    this.url = _url;
  }

  getSignedURL () {
    return this.url;
  }
}

class KinesisUtil {
  constructor () {
  }

  /**
   * 
   * @param {*} kinesisInfo Kinesis data retrieved from the backend 
   * 
   * @param {*} clientId this should be a unique ID either user id or any unique id
   * @returns 
   */
  async initializeViewer (kinesisInfo, clientId) {
    const result = { errorCode: ERROR_CODE.UNKNOWN_ERROR }; /* IF THIS FUNCTION CANNOT REACH FINAL OK STATE -> ERROR */
    const role = 'VIEWER';
    this.clientId = clientId;
    this.role = role;

    const configuration = kinesisInfo.configuration;

    if (this.signalingClient) {
      this.signalingClient.close();
      this.signalingClient = null;
    }

    this.signalingClient = new SignalingClient({
      requestSigner: new CustomSigner(kinesisInfo.url), /** Use the customSigner to return the signed url, so we can ignore aws credentials
      and regions, channelARN and channelEndpoint can be any text */
      region: 'default region, (any text) as region is already part of signedurl',
      role,
      clientId,
      channelARN: 'default channel, (any text) as channelARN is already part of signedurl',
      channelEndpoint: 'default endpoint (any text) as endpoint is already part of signedurl'
    });

    this.peerConnection = new RTCPeerConnection(configuration);

    this.signalingClient.on('open', async () => {
      // code to run for open event
    });

    this.signalingClient.on('close', () => {
      console.warn('Current signaling closed');
    });

    this.signalingClient.on('error', (e) => {
      console.error('SignalingClient error:', e);
    });

    this.signalingClient.on('sdpOffer', async (offer, remoteClientId) => {
      const peerConnection = new RTCPeerConnection(configuration);
      this.peerConnectionByClientId[remoteClientId] = peerConnection;
      // Other code to run
    });

    this.signalingClient.open();

    result.errorCode = ERROR_CODE.OK;
    return result;
  }

  async initializeMaster (kinesisInfo, localView, videoSize) {
    const result = { errorCode: ERROR_CODE.UNKNOWN_ERROR }; /* IF THIS FUNCTION CANNOT REACH FINAL OK STATE -> ERROR */
    const role = 'MASTER';
    this.clientId = 'MASTER_ID';
    this.role = role;
    this.peerConnectionByClientId = {};

    const configuration = kinesisInfo.configuration;

    /** Custom Signer class with get signed url
     * method to return the signed url from backend
     *  so other credentials can be left as default
     * */
    this.signalingClient = new SignalingClient({
      requestSigner: new CustomSigner(kinesisInfo.url),
      role,
      region: 'default region, (any text) as region is already part of signedurl',
      channelARN: 'default channel, (any text) as channelARN is already part of signedurl',
      channelEndpoint: 'default endpoint (any text) as endpoint is already part of signedurl'
    });

    this.signalingClient.on('open', async () => {
      // code to run on connection open
    });

    this.signalingClient.on('sdpOffer', async (offer, remoteClientId) => {
      const peerConnection = new RTCPeerConnection(configuration);
      this.peerConnectionByClientId[remoteClientId] = peerConnection;
      // Other code to run
    });

    this.signalingClient.on('close', () => {
      // code to run on connection close
    });

    this.signalingClient.on('error', (e) => {
      // code to run on error
    });

    this.signalingClient.open();
    /* LAST */
    if (this.signalingClient) {
      this.signalingClient.close();
      this.signalingClient = null;
    }
    result.errorCode = ERROR_CODE.OK;
    return result;
  }
}

export {
  KinesisUtil
};
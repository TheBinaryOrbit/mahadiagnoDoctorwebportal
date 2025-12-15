import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, updateDoc, onSnapshot, addDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { firebaseConfig } from '../config/firebase';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

const configuration = {
  iceServers: [
    { urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] },
  ],
  iceCandidatePoolSize: 10,
};

const Videocall = () => {
  const { callId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inCall, setInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const firestoreUnsubscribers = useRef([]);
  const callStartTime = useRef(null);
  const controlsTimer = useRef(null);
  const callInitialized = useRef(false);
  const isCleaningUp = useRef(false);

  // Get route state params
  const { appointmentId, patientName } = location.state || {};

  useEffect(() => {
    // Prevent multiple initializations
    if (callInitialized.current) return;
    
    if (callId) {
      callInitialized.current = true;
      initiateCall(callId);
    } else {
      toast.error("No Call ID was provided.");
      navigate(-1);
      return;
    }

    // Main cleanup function runs ONLY on component unmount
    return () => {
      console.log('Component unmounting, cleaning up...');
      hangUp();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Separate effect for timers to avoid cleanup issues
  useEffect(() => {
    // Call duration timer
    const durationInterval = setInterval(() => {
      if (callStartTime.current) {
        setCallDuration(Math.floor((Date.now() - callStartTime.current) / 1000));
      }
    }, 1000);

    // Auto-hide controls after 5 seconds
    const hideControlsTimer = setTimeout(() => {
      setShowControls(false);
    }, 5000);

    return () => {
      clearInterval(durationInterval);
      clearTimeout(hideControlsTimer);
    };
  }, []);

  // Update local video element when localStream changes
  useEffect(() => {
    console.log('Local stream changed:', localStream ? 'Stream exists' : 'No stream');
    console.log('Local video ref:', localVideoRef.current ? 'Ref exists' : 'No ref');
    
    if (localStream) {
      if (localVideoRef.current) {
        console.log('Setting local video srcObject, tracks:', localStream.getTracks().map(t => t.kind));
        console.log('Local stream ID:', localStream.id);
        console.log('Video track enabled:', localStream.getVideoTracks()[0]?.enabled);
        console.log('Video track readyState:', localStream.getVideoTracks()[0]?.readyState);
        
        localVideoRef.current.srcObject = localStream;
        
        // Verify srcObject was set
        console.log('srcObject set successfully:', localVideoRef.current.srcObject === localStream);
        
        // Ensure video element properties
        localVideoRef.current.muted = true;
        localVideoRef.current.playsInline = true;
        
        // Force video to play
        const playPromise = localVideoRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => console.log('Local video playing successfully'))
            .catch(e => console.error('Error playing local video:', e));
        }
      } else {
        // Retry after a short delay if ref not ready
        setTimeout(() => {
          if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
            localVideoRef.current.play();
          }
        }, 100);
      }
    } else {
      console.log('Cannot set local video - missing stream or ref');
    }
  }, [localStream]);

  // Update remote video element when remoteStream changes
  useEffect(() => {
    console.log('Remote stream changed:', remoteStream ? 'Stream exists' : 'No stream');
    console.log('Remote video ref:', remoteVideoRef.current ? 'Ref exists' : 'No ref');
    
    if (remoteStream && remoteVideoRef.current) {
      console.log('Setting remote video srcObject, tracks:', remoteStream.getTracks().map(t => t.kind));
      console.log('Remote stream ID:', remoteStream.id);
      console.log('Local stream ID:', localStream?.id);
      
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.playsInline = true;
      
      const playPromise = remoteVideoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => console.log('Remote video playing successfully'))
          .catch(e => console.error('Error playing remote video:', e));
      }
    }
  }, [remoteStream, localStream]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleControls = () => {
    setShowControls(!showControls);
    if (controlsTimer.current) {
      clearTimeout(controlsTimer.current);
    }
    if (!showControls) {
      controlsTimer.current = setTimeout(() => {
        setShowControls(false);
      }, 5000);
    }
  };

  const setupMedia = async () => {
    try {
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: {
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 },
          frameRate: { min: 15, ideal: 30, max: 30 },
          facingMode: 'user'
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      console.log('Media stream obtained with tracks:');
      stream.getTracks().forEach(track => {
        console.log(`  - ${track.kind}: ${track.label}, enabled: ${track.enabled}, readyState: ${track.readyState}`);
        // Explicitly enable all tracks
        track.enabled = true;
      });
      
      // Ensure audio track is enabled
      stream.getAudioTracks().forEach(track => {
        track.enabled = true;
        console.log(`Audio track explicitly enabled: ${track.label}`);
      });
      
      // Ensure video track is enabled by default
      stream.getVideoTracks().forEach(track => {
        track.enabled = true;
        console.log(`Video track explicitly enabled: ${track.label}`);
      });

      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error("Error getting media stream:", error);
      toast.error("Could not access camera or microphone. Please grant permissions.");
      return null;
    }
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleSpeaker = () => {
    // Web browsers handle audio output automatically
    // This is more of a UI toggle for consistency
    const newSpeakerState = !isSpeakerOn;
    setIsSpeakerOn(newSpeakerState);
    console.log('Speaker toggled to:', newSpeakerState ? 'Speaker' : 'Earpiece');
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const switchCamera = async () => {
    try {
      if (localStream) {
        const videoTrack = localStream.getVideoTracks()[0];
        const currentFacingMode = videoTrack.getSettings().facingMode;
        
        // Stop current stream
        localStream.getTracks().forEach(track => track.stop());
        
        // Get new stream with opposite facing mode
        const newConstraints = {
          audio: true,
          video: {
            facingMode: currentFacingMode === 'user' ? 'environment' : 'user'
          }
        };
        
        const newStream = await navigator.mediaDevices.getUserMedia(newConstraints);
        setLocalStream(newStream);
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = newStream;
        }
        
        // Replace tracks in peer connection
        if (peerConnection.current) {
          const videoTrack = newStream.getVideoTracks()[0];
          const sender = peerConnection.current.getSenders().find(s => s.track?.kind === 'video');
          if (sender) {
            sender.replaceTrack(videoTrack);
          }
        }
      }
    } catch (error) {
      console.error('Error switching camera:', error);
    }
  };

  const initializePeerConnection = (stream) => {
    peerConnection.current = new RTCPeerConnection(configuration);

    // Add local stream tracks to the connection
    stream.getTracks().forEach(track => {
      console.log(`Adding ${track.kind} track to peer connection:`, track.label, 'enabled:', track.enabled);
      peerConnection.current.addTrack(track, stream);
    });
    
    console.log('Total tracks added to peer connection:', peerConnection.current.getSenders().length);

    // --- KEY HANDLERS ---

    // 1. Handles the arrival of the remote stream
    peerConnection.current.ontrack = event => {
      console.log('ONTRACK EVENT: A remote track was received!', event.track.kind);
      if (event.streams && event.streams[0]) {
        console.log('Remote stream tracks:', event.streams[0].getTracks().map(t => `${t.kind}: ${t.enabled}`));
        setRemoteStream(event.streams[0]);
      }
    };

    // 2. Monitors the connection status (crucial for debugging)
    peerConnection.current.oniceconnectionstatechange = () => {
      const state = peerConnection.current?.iceConnectionState;
      console.log('ICE Connection State changed to:', state);
      
      // Only end call on permanent failures, not temporary disconnections
      if (state === 'failed' || state === 'closed') {
        console.log('Connection permanently failed or closed');
        toast.info('Video Call Ended');
        navigate(-1);
      } else if (state === 'disconnected') {
        console.log('Connection temporarily disconnected, waiting for reconnection...');
        // Don't end the call, allow WebRTC to try to reconnect
      }
    };
  };

  const initiateCall = async (id) => {
    try {
      // Prevent re-initialization if peer connection already exists
      if (peerConnection.current) {
        console.log('Call already initialized, skipping...');
        return;
      }

      console.log('Starting call initialization with ID:', id);
      setLoading(true);
      const localStream = await setupMedia();
      if (!localStream) {
        console.error('Failed to get local media stream');
        setLoading(false);
        callInitialized.current = false;
        return;
      }

      console.log('Local stream obtained:', localStream.getTracks());
      initializePeerConnection(localStream);

      const callDocRef = doc(firestore, 'calls', id);

      const callSnapshot = await getDoc(callDocRef);

      // SCENARIO A: You are the first to join (the "Caller")
      if (!callSnapshot.exists() || !callSnapshot.data()?.offer) {
        console.log('Creating offer as the caller...');
        
        // Set up ICE candidate collection for caller
        collectIceCandidates(callDocRef, true);
        
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);
        await setDoc(callDocRef, { offer });
        console.log('Offer created and sent to Firestore');

        // Listen for the answer from the joiner
        const unsub = onSnapshot(callDocRef, (snapshot) => {
          const data = snapshot.data();
          if (peerConnection.current && !peerConnection.current.remoteDescription && data?.answer) {
            console.log('Answer received from joiner');
            const answerDescription = new RTCSessionDescription(data.answer);
            peerConnection.current.setRemoteDescription(answerDescription);
          }
        });
        firestoreUnsubscribers.current.push(unsub);
      }
      // SCENARIO B: You are the second to join (the "Joiner")
      else {
        console.log('Joining call as the second participant...');
        const { offer } = callSnapshot.data();
        
        // Set up ICE candidate collection for callee
        collectIceCandidates(callDocRef, false);
        
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        await updateDoc(callDocRef, { answer });
        console.log('Answer created and sent to Firestore');
      }

      setInCall(true);
      setLoading(false);
      callStartTime.current = Date.now();
      console.log('Call setup completed successfully, inCall:', true);
    } catch (e) {
      console.error("An error occurred in initiateCall:", e);
      console.error("Error name:", e.name);
      console.error("Error message:", e.message);
      console.error("Error stack:", e.stack);
      
      setLoading(false);
      setInCall(false);
      callInitialized.current = false;
      
      // Clean up on error
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
      if (peerConnection.current) {
        peerConnection.current.close();
        peerConnection.current = null;
      }
      
      // Show specific error message
      const errorMsg = e.message || 'Unknown error occurred';
      toast.error(`Failed to initiate call: ${errorMsg}. Please check camera/microphone permissions, Firebase configuration, and internet connection.`);
      
      // Navigate back after showing error
      setTimeout(() => navigate(-1), 100);
    }
  };

  const collectIceCandidates = (docRef, isOfferer) => {
    const callerCandidatesCollection = collection(docRef, 'callerCandidates');
    const calleeCandidatesCollection = collection(docRef, 'calleeCandidates');

    // Generates and sends local ICE candidates to Firestore
    peerConnection.current.onicecandidate = event => {
      if (event.candidate) {
        // If we created the offer, we are the caller
        // If we received the offer, we are the callee
        const targetCollection = isOfferer ? callerCandidatesCollection : calleeCandidatesCollection;
        addDoc(targetCollection, event.candidate.toJSON())
          .catch(e => console.error('Error adding ICE candidate to Firestore:', e));
      }
    };

    // Listen to the OTHER peer's candidates
    // If we're the caller, listen to callee candidates
    // If we're the callee, listen to caller candidates
    const remoteCandidatesCollection = isOfferer ? calleeCandidatesCollection : callerCandidatesCollection;
    
    const unsub = onSnapshot(remoteCandidatesCollection, (snapshot) => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
          const candidate = new RTCIceCandidate(change.doc.data());
          // Only add if we have a remote description
          if (peerConnection.current && peerConnection.current.remoteDescription) {
            peerConnection.current.addIceCandidate(candidate)
              .catch(e => console.error('Error adding received ICE candidate', e));
          }
        }
      });
    });
    
    firestoreUnsubscribers.current.push(unsub);
  };

  const hangUp = async () => {
    // Prevent multiple cleanup calls
    if (isCleaningUp.current) {
      console.log('Already cleaning up, skipping...');
      return;
    }
    
    // Don't clean up if there's nothing to clean
    if (!peerConnection.current && !localStream && firestoreUnsubscribers.current.length === 0) {
      console.log('Nothing to clean up, skipping...');
      return;
    }
    
    isCleaningUp.current = true;
    console.log('Hanging up call...');
    
    try {
      // 1. Delete the call document from Firestore
      if (callId) {
        const callDocRef = doc(firestore, 'calls', callId);

        // Delete the main call document
        await deleteDoc(callDocRef);

        // Delete caller candidates subcollection
        const callerCandidates = await getDocs(collection(callDocRef, 'callerCandidates'));
        const callerDeletePromises = callerCandidates.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(callerDeletePromises);

        // Delete callee candidates subcollection
        const calleeCandidates = await getDocs(collection(callDocRef, 'calleeCandidates'));
        const calleeDeletePromises = calleeCandidates.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(calleeDeletePromises);

        console.log('Call document and subcollections deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting call document:', error);
      // Continue with cleanup even if deletion fails
    }

    // 2. Stop all listeners
    firestoreUnsubscribers.current.forEach(unsubscribe => unsubscribe());
    firestoreUnsubscribers.current = [];

    // 3. Stop local media tracks
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }

    // 4. Close the WebRTC peer connection
    if (peerConnection.current) {
      peerConnection.current.close();
    }

    // 5. Reset component state and navigate back
    setLocalStream(null);
    setRemoteStream(null);
    setInCall(false);
    navigate(-1);
    peerConnection.current = null;
    
    // Don't navigate back here, let the caller decide
    // navigate(-1);
  };

  return (
    <div className="fixed inset-0 bg-black">
      {loading ? (
        <div className="flex-1 flex flex-col justify-center items-center bg-gray-900 h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          <p className="text-white mt-4 text-base">Connecting to call...</p>
          {patientName && (
            <p className="text-gray-400 mt-2 text-sm">Calling {patientName}</p>
          )}
        </div>
      ) : inCall && localStream ? (
        <div className="flex-1 h-screen" onClick={toggleControls}>
          {/* Remote Video (Main View) - PATIENT CAMERA */}
          <div className="flex-1 relative h-full">
            {remoteStream ? (
              <video
                ref={(el) => {
                  remoteVideoRef.current = el;
                  if (el && remoteStream && el.srcObject !== remoteStream) {
                    console.log('Setting remote srcObject directly in ref callback');
                    el.srcObject = remoteStream;
                    el.play().catch(e => console.error('Remote play error:', e));
                  }
                }}
                autoPlay
                playsInline
                className="w-full h-full object-contain bg-black"
              />
            ) : (
              <div className="flex-1 bg-gray-900 flex flex-col justify-center items-center h-full">
                <div className="w-30 h-30 rounded-full bg-gray-700 flex justify-center items-center mb-5">
                  <svg className="w-15 h-15 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-white text-lg mb-2">{patientName || 'Patient'}</p>
                <p className="text-gray-400 text-sm">Connecting...</p>
              </div>
            )}

            {/* Local Video (Picture-in-Picture) - YOUR CAMERA */}
            <div
              className="absolute top-20 right-5 border-2 border-white rounded-2xl overflow-hidden bg-gray-800 shadow-lg"
              style={{ width: '150px', height: '200px', zIndex: 10 }}
            >
              <video
                ref={(el) => {
                  localVideoRef.current = el;
                  if (el && localStream && el.srcObject !== localStream) {
                    console.log('Setting srcObject directly in ref callback');
                    el.srcObject = localStream;
                    el.play().catch(e => console.error('Play error:', e));
                  }
                }}
                autoPlay
                playsInline
                muted
                controls={false}
                className="w-full h-full object-cover bg-black"
                style={{ transform: 'scaleX(-1)' }}
              />
              {!localStream && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                  <div className="text-white text-xs">No camera</div>
                </div>
              )}
            </div>

            {/* Top Header with Call Info */}
            {showControls && (
              <div className="absolute top-0 left-0 right-0 pt-4 px-5 pb-5 bg-gradient-to-b from-black/50 to-transparent">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white text-lg font-bold">{patientName || 'Video Call'}</p>
                    <p className="text-gray-300 text-sm mt-1">{formatDuration(callDuration)}</p>
                  </div>
                  <button
                    onClick={switchCamera}
                    className="w-11 h-11 rounded-full bg-white bg-opacity-20 flex justify-center items-center hover:bg-opacity-30 transition-all"
                  >
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Controls */}
            {showControls && (
              <div className="absolute bottom-0 left-0 right-0 pb-6 px-5 pt-5 bg-gradient-to-t from-black/50 to-transparent">
                <div className="flex justify-center items-center gap-5">
                  {/* Mute Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMute();
                    }}
                    className={`w-16 h-16 rounded-full flex justify-center items-center transition-all shadow-lg ${
                      isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-800 bg-opacity-80 hover:bg-opacity-100'
                    }`}
                  >
                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                      {isMuted ? (
                        <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                      ) : (
                        <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                      )}
                    </svg>
                  </button>

                  {/* Video Toggle Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleVideo();
                    }}
                    className={`w-16 h-16 rounded-full flex justify-center items-center transition-all shadow-lg ${
                      !isVideoEnabled ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-800 bg-opacity-80 hover:bg-opacity-100'
                    }`}
                  >
                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                      {isVideoEnabled ? (
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                      ) : (
                        <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                      )}
                    </svg>
                  </button>

                  {/* Speaker Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSpeaker();
                    }}
                    className={`w-16 h-16 rounded-full flex justify-center items-center transition-all shadow-lg ${
                      isSpeakerOn ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-800 bg-opacity-80 hover:bg-opacity-100'
                    }`}
                  >
                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                      {isSpeakerOn ? (
                        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                      ) : (
                        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      )}
                    </svg>
                  </button>

                  {/* End Call Button */}
                  <button
                    onClick={hangUp}
                    className="w-16 h-16 rounded-full bg-red-600 flex justify-center items-center mx-2 hover:bg-red-700 transition-all"
                  >
                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-center items-center bg-gray-900 h-screen">
          <svg className="w-12 h-12 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-white text-lg mt-4 text-center px-10">Unable to join the call</p>
          <p className="text-gray-400 text-sm mt-2 text-center px-10">
            Please check your internet connection and try again
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-6 px-8 py-3 bg-[#009e92] rounded-lg text-white text-base font-semibold hover:bg-[#018177] transition-colors"
          >
            Go Back
          </button>
        </div>
      )}
    </div>
  );
};

export default Videocall;

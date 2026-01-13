import React, { useState, useRef, useEffect, useCallback } from 'react'
import ReactHowler from 'react-howler'
import raf from 'raf'
import {Button} from 'react-bootstrap'

const playlist ={ src :'/audios/song2.mp3'}

const FullControlsss = () => {
  const playerRef = useRef(null)
  const rafRef = useRef(null)

  const [playing, setPlaying] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [loop, setLoop] = useState(false)
  const [mute, setMute] = useState(false)
  const [volume, setVolume] = useState(1.0)
  const [seek, setSeek] = useState(0.0)
  const [rate, setRate] = useState(1)
  const [isSeeking, setIsSeeking] = useState(false)
  const [duration, setDuration] = useState(null)

  const clearRAF = () => {
    if (rafRef.current) {
      raf.cancel(rafRef.current)
      rafRef.current = null
    }
  }

  useEffect(() => {
    return () => clearRAF()
  }, [])

  const renderSeekPos = useCallback(() => {
    if (!isSeeking && playerRef.current) {
      setSeek(playerRef.current.seek())
    }

    if (playing) {
      rafRef.current = raf(renderSeekPos)
    }
  }, [isSeeking, playing])

  const handleToggle = () => {
    setPlaying(prev => !prev)
  }

  const handleOnLoad = () => {
    if (playerRef.current) {
      setLoaded(true)
      setDuration(playerRef.current.duration())
    }
  }

  const handleOnPlay = () => {
    setPlaying(true)
    renderSeekPos()
  }

  const handleOnEnd = () => {
    setPlaying(false)
    clearRAF()
  }

  const handleStop = () => {
    playerRef.current?.stop()
    setPlaying(false)
    renderSeekPos()
  }

  const handleMouseDownSeek = () => {
    setIsSeeking(true)
  }

  const handleMouseUpSeek = (e) => {
    setIsSeeking(false)
    playerRef.current?.seek(parseFloat(e.target.value))
  }

  const handleSeekingChange = (e) => {
    setSeek(parseFloat(e.target.value))
  }

  const handleRate = (e) => {
    const newRate = parseFloat(e.target.value)
    // playerRef.current?.rate(newRate)
    setRate(newRate)
  }

  return (
    <div className='full-control'>
      <ReactHowler
        src={playlist.src}
        playing={playing}
        loop={loop}
        rate={rate}
        mute={mute}
        volume={volume}
        onLoad={handleOnLoad}
        onPlay={handleOnPlay}
        onEnd={handleOnEnd}
        ref={playerRef}
      />

      <p>{loaded ? 'Loaded' : 'Loading'}</p>

      <div className='toggles'>
        <label>
          Loop:
          <input
            type='checkbox'
            checked={loop}
            onChange={() => setLoop(!loop)}
          />
        </label>

        <label>
          Mute:
          <input
            type='checkbox'
            checked={mute}
            onChange={() => setMute(!mute)}
          />
        </label>
      </div>

      <p>
        Status: {seek.toFixed(2)} / {duration ? duration.toFixed(2) : 'NaN'}
      </p>

      <div className='volume'>
        <label>
          Volume:
          <span className='slider-container'>
            <input
              type='range'
              min='0'
              max='1'
              step='.05'
              value={volume}
              onChange={e => setVolume(parseFloat(e.target.value))}
            />
          </span>
          {volume.toFixed(2)}
        </label>
      </div>

      <div className='seek'>
        <label>
          Seek:
          <span className='slider-container'>
            <input
              type='range'
              min='0'
              max={duration ? duration.toFixed(2) : 0}
              step='.01'
              value={seek}
              onChange={handleSeekingChange}
              onMouseDown={handleMouseDownSeek}
              onMouseUp={handleMouseUpSeek}
            />
          </span>
        </label>
      </div>

      <div className='rate'>
        <label>
          Rate:
          <span className='slider-container'>
            <input
              type='range'
              min='0.1'
              max='3'
              step='.01'
              value={rate}
              onChange={handleRate}
            />
          </span>
          {rate.toFixed(2)}
        </label>
      </div>

      <Button onClick={handleToggle}>
        {playing ? 'Pause' : 'Play'}
      </Button>

      <Button onClick={handleStop}>
        Stop
      </Button>
    </div>
  )
}

export default FullControlsss

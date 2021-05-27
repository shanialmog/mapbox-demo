import mapboxgl from 'mapbox-gl'
import { useEffect, useState, useRef } from 'react'

import 'mapbox-gl/dist/mapbox-gl.css'
import './App.css'

mapboxgl.accessToken = 'pk.eyJ1Ijoic2hhbmlhbCIsImEiOiJja255ZGNzeDUxZmNjMm9vYW5sMHJlOGl4In0.4jYO29I1bJmuCg8FxL1rKw'

// Create data-mapbox-marker-id constant

const App = () => {

  const [markerFormTitle, setMarkerFormTitle] = useState("")
  const [markerFormDescription, setMarkerFormDescription] = useState("")
  const [activeOption, setActiveOption] = useState('')
  const [map, setMap] = useState(null)
  const [markers, setMarkers] = useState({})
  const [activeMarkerId, setActiveMarkerId] = useState(null)

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/light-v10',
      center: [34.81900115008375, 32.09872132522804],
      zoom: 14
    })

    map.on('click', onMapClickHandler)
    setMap(map)
    return () => map.remove()
  }, [])

  const onMapClickHandler = (e) => {
    setActiveOption(activeOption => {
      if (!activeOption) {
        return
      }
      const element = createMarkerElement(activeOption)
      const marker = new mapboxgl.Marker({ element })
        .setLngLat([e.lngLat.lng, e.lngLat.lat])
      setMap(map => {
        marker.addTo(map)
        return map
      })
      const markerElement = marker.getElement()
      markerElement.addEventListener('click', markerClickHandler)
      const markerId = '' + Math.round(Math.random() * 1000) // Save markerId as string for setAttribute
      markerElement.setAttribute('data-id', markerId)
      setMarkers((prevState) => {
        setActiveMarkerId(markerId)
        return {
          ...prevState,
          [markerId]: {
            type: activeOption,
            title: '',
            description: '',
            ref: marker // Reference to mapbox marker instance
          }
        }
      })
      return activeOption
    })
  }

  const createMarkerElement = (type) => {
    const el = document.createElement('div')
    if (type === 'marker') {
      const svgEl1 = document.createElement('img')
      const svgEl2 = document.createElement('img')
      svgEl1.classList.add('default-marker')
      svgEl2.classList.add('active-marker')
      svgEl1.src = '/assets/MarkerIcon.svg'
      svgEl2.src = '/assets/ActiveMarkerIcon.svg'
      el.appendChild(svgEl1)
      el.appendChild(svgEl2)
    } else if (type === 'route') {
      el.classList.add('route-pointer')
    } else {
      throw new Error(`Unknown marker type: ${type}`)
    }
    return el
  }

  const markerClickHandler = (e) => {
    // Prevent map click event from triggering
    e.stopPropagation()
    const markerId = e.target.parentNode.getAttribute('data-id')
    setActiveMarkerId(markerId)
  }


  useEffect(() => {
    if (activeMarkerId) {
      setMarkerFormTitle(markers[activeMarkerId].title)
      setMarkerFormDescription(markers[activeMarkerId].description)
    }
    if (map) {
      const markerElements = map.getContainer().querySelectorAll('.mapboxgl-marker')
      markerElements.forEach((markerEl) => {
        if (markerEl.getAttribute('data-id') === activeMarkerId) {
          markerEl.classList.add('active')
        } else {
          markerEl.classList.remove('active')
        }
      })
    }
    // eslint-disable-next-line
  }, [activeMarkerId])

  const onFormTitleChange = (e) => {
    setMarkerFormTitle(e.target.value)
  }

  const onFormDescriptionChange = (e) => {
    setMarkerFormDescription(e.target.value)
  }

  const onMarkerDelete = () => {
    Object.keys(markers).forEach((markerId) => {
      if (markerId === activeMarkerId) {
        markers[markerId].ref.remove()
      }
    })

    setMarkers((prevState) => {
      delete prevState[activeMarkerId]
      return prevState
    })
  }

  const onFormSubmit = (e) => {
    e.preventDefault()
    setMarkers((prevState) => {
      setMarkerFormTitle("")
      setMarkerFormDescription("")
      setActiveMarkerId(null)
      return {
        ...prevState,
        [activeMarkerId]: {
          ...prevState[activeMarkerId],
          title: markerFormTitle,
          description: markerFormDescription
        }
      }
    })
  }

  const createRoute = () => {
    setActiveOption('route')
    // Get points on map to create a line
  }

  const createMarker = () => {
    setActiveOption('marker')
    // Get points on map to create a line
  }

  return (
    <div className='container'>
      <h1>Build your personal route</h1>
      <div>
        <button
          className={activeOption === 'marker' && 'active-option'}
          onClick={createMarker}>
          MARKER
          </button>
        <button
          className={activeOption === 'route' && 'active-option'}
          onClick={createRoute}>
          ROUTE
          </button>
        <div id='map'></div>
        <div className='form-container'>
          {
            activeMarkerId &&
            <form onSubmit={onFormSubmit}>
              <div className="form-group">
                <label htmlFor="title" className="control-label">Title</label>
                <input
                  className="form-control"
                  type='text'
                  value={markerFormTitle}
                  onChange={onFormTitleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="title" className="control-label">Description</label>
                <textarea
                  className="form-control"
                  type='text'
                  value={markerFormDescription}
                  onChange={onFormDescriptionChange}
                />
              </div>
              <div className="form-btn-container">
                <input type="submit" value="SUBMIT" />
                <button onClick={onMarkerDelete}>DELETE</button>
              </div>
            </form>
          }
        </div>
      </div>
    </div>
  )
}

export default App

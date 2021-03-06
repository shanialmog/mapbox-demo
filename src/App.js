import mapboxgl from 'mapbox-gl'
import { useEffect, useState, useRef } from 'react'

import 'mapbox-gl/dist/mapbox-gl.css'
import './App.css'

mapboxgl.accessToken = 'pk.eyJ1Ijoic2hhbmlhbCIsImEiOiJja255ZGNzeDUxZmNjMm9vYW5sMHJlOGl4In0.4jYO29I1bJmuCg8FxL1rKw'

// Create data-mapbox-marker-id constant

const App = () => {

  const [markerFormTitle, setMarkerFormTitle] = useState("")
  const [markerFormDescription, setMarkerFormDescription] = useState("")
  const [markers, setMarkers] = useState({})
  const [activeMarkerId, setActiveMarkerId] = useState(null)
  // Using useRef since Mapbox-GL is not a React component
  const map = useRef(null)
  const [_activeOption, setActiveOption] = useState('')
  const activeOption = useRef('')

  useEffect(() => {
    const _map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/light-v10',
      center: [34.81900115008375, 32.09872132522804],
      zoom: 14
    })
    _map.on('click', onMapClickHandler)
    map.current = _map

    _map.on('load', () => {
      addRouteLayer()
    })

    return () => _map.remove()
  }, [])

  const onMapClickHandler = (e) => {
    if (activeOption.current === 'route') {
      addRouteLayerLine(e.lngLat.lng, e.lngLat.lat)
    }
    const element = createMarkerElement(activeOption.current)
    const marker = new mapboxgl.Marker({ element })
      .setLngLat([e.lngLat.lng, e.lngLat.lat])
    marker.addTo(map.current)
    const markerElement = marker.getElement()
    markerElement.addEventListener('click', markerClickHandler)
    const markerId = '' + Math.round(Math.random() * 1000) // Save markerId as string for setAttribute
    markerElement.setAttribute('data-id', markerId)
    setMarkers((prevState) => {
      setActiveMarkerId(markerId)
      return {
        ...prevState,
        [markerId]: {
          type: activeOption.current,
          title: '',
          description: '',
          ref: marker // Reference to mapbox marker instance
        }
      }
    })
  }

  const addRouteLayer = () => {
    map.current.addSource('route', {
      'type': 'geojson',
      'data': {
        'type': 'Feature',
        'properties': {},
        'geometry': {
          'type': 'LineString',
          'coordinates': []
        }
      }
    })
    map.current.addLayer({
      'id': 'routeLine',
      'type': 'line',
      'source': 'route',
      'layout': {
        'line-join': 'round',
        'line-cap': 'round'
      },
      'paint': {
        'line-color': '#888',
        'line-width': 8
      }
    })
  }

  const addRouteLayerLine = (lng, lat) => {
    const data = map.current.getSource('route')._data
    data.geometry.coordinates.push([lng, lat])
    map.current.getSource('route').setData(data)
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
    if (map.current) {
      const markerElements = map.current.getContainer().querySelectorAll('.mapboxgl-marker')
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
    activeOption.current = 'route'
    // Get points on map to create a line
  }

  const createMarker = () => {
    setActiveOption('marker')
    activeOption.current = 'marker'
    // Get points on map to create a line
  }

  const clearRoute = () => {
    const data = map.current.getSource('route')._data
    data.geometry.coordinates = []
    map.current.getSource('route').setData(data)

    Object.keys(markers).forEach((markerId) => {
      if (markers[markerId].type === 'route') {
        markers[markerId].ref.remove()
      }
    })

    setMarkers((prevState) => {
      return Object.keys(prevState).filter((markerId) => {
        return prevState[markerId].type !== 'route'
      })
    })
  }

  return (
    <div className='container'>
      <h1>Build your personal route</h1>
      <div>
        <button
          className={_activeOption === 'marker' ? 'active-option' : null}
          onClick={createMarker}>
          MARKER
          </button>
        <button
          className={_activeOption === 'route' ? 'active-option' : null}
          onClick={createRoute}>
          ROUTE
          </button>
        <div id='map'></div>
        <div className='form-container'>
          {
            (activeMarkerId && _activeOption === 'marker') &&
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
          {
            _activeOption === 'route' &&
            <button onClick={clearRoute}>CLEAR ROUTE</button>
          }
        </div>
      </div>
    </div>
  )
}

export default App

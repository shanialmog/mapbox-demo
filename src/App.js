import mapboxgl from 'mapbox-gl'
import { useEffect, useState } from 'react'
import mockRoute from './mocks/mockRouteGPX'
// import mockRoute from './mocks/mockRoute'

import 'mapbox-gl/dist/mapbox-gl.css'
import './App.css'
import ActiveMarkerIcon from './asset/ActiveMarkerIcon'

mapboxgl.accessToken = 'pk.eyJ1Ijoic2hhbmlhbCIsImEiOiJja255ZGNzeDUxZmNjMm9vYW5sMHJlOGl4In0.4jYO29I1bJmuCg8FxL1rKw'

const App = () => {

  const [markerFormTitle, setMarkerFormTitle] = useState("")
  const [markerFormDescription, setMarkerFormDescription] = useState("")
  const [isRouteLoaded, setIsRouteLoaded] = useState(false)
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

    map.on('click', function (e) {
      const marker = new mapboxgl.Marker()
        .setLngLat([e.lngLat.lng, e.lngLat.lat])
        .addTo(map)
      const markerElement = marker.getElement()
      markerElement.addEventListener('click', (e) => {
        // Prevent map click event from triggering
        e.stopPropagation()
        const markerId = e.target.parentNode.parentNode.parentNode.parentNode.getAttribute('data-id')
        setActiveMarkerId(markerId)
      })
      const markerId = '' + Math.round(Math.random() * 1000) // Save markerId as string for setAttribute
      markerElement.setAttribute('data-id', markerId)
      setMarkers((prevState) => {
        setActiveMarkerId(markerId)
        return {
          ...prevState, [markerId]: {
            title: '',
            description: '',
            ref: marker // Reference to mapbox marker instance
          }
        }
      })
    })

    setMap(map)
    return () => map.remove()
  }, [])

  useEffect(() => {
    if (activeMarkerId) {
      setMarkerFormTitle(markers[activeMarkerId].title)
      setMarkerFormDescription(markers[activeMarkerId].description)
    }
    if (map) {
      const markerElements = map.getContainer().querySelectorAll('.mapboxgl-marker')
      markerElements.forEach((markerEl) => {
        if (markerEl.getAttribute('data-id') === activeMarkerId) {
          console.log(markerEl)
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

  const loadRoute = () => {
    setIsRouteLoaded(true)
    // TODO Get data from user
    map.addSource('route', mockRoute)
    map.addLayer({
      'id': 'route',
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
    map.setCenter(mockRoute.data.geometry.coordinates[0])
  }

  return (
    <div className='container'>
      <h1>Build your personal route</h1>
      <div>
        {
          !isRouteLoaded &&
          <button onClick={loadRoute}>LOAD ROUTE</button>
        }
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

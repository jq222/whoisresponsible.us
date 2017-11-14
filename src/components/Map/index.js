// @flow
import React, {Component} from 'react'
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup
} from 'react-simple-maps'
import cn from 'classnames'
import {Motion, spring} from 'react-motion'
import withRedux from 'next-redux-wrapper'
import {initStore} from '../../store'

import {actions as tooltipActions} from 'redux-tooltip'

import {scalePow} from 'd3-scale'

import type {Geography as GeographyType} from '../../types.js'

import data from '../../resources/aggregate-by-country.json'
import styles from './styles.css'

const excludes = [
  'ATA'
  // 'GRL'
]

const ZOOM = 10

const popScale = scalePow()
  .domain([0, 1])
  .range(['#33343D', '#D8D8D8'])

type Props = {
  activeSubcategories: string[],
  dispatch: *, // TODO: Properly type
  primaryCode?: string,
  secondaryCode?: string,
  isShowingAll: boolean,
  onGeographyClick: (geography: GeographyType) => mixed
}

type State = {
  canHover: boolean,
  isOptimizationDisabled: boolean,
  zoom: number,
  center: [number, number]
}

class Map extends Component<Props, State> {
  state = {
    canHover: false,
    isOptimizationDisabled: false,
    zoom: 1,
    center: [0, 0],
    isPanning: false
  }

  componentDidMount() {
    const canHover =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(hover: hover)').matches
    this.setState((state: State) => ({canHover}))
  }

  componentWillReceiveProps(nextProps: Props) {
    if (
      this.props.activeSubcategories.length !==
        nextProps.activeSubcategories.length ||
      this.props.primaryCode !== nextProps.primaryCode ||
      this.props.secondaryCode !== nextProps.secondaryCode ||
      this.props.isShowingAll !== nextProps.isShowingAll
    ) {
      this.setState((state: State) => ({isOptimizationDisabled: true}))
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (this.state.isOptimizationDisabled) {
      this.setState((state: State) => ({isOptimizationDisabled: false}))
    }
  }

  getScale = (code: string) => {
    const {activeSubcategories} = this.props

    if (!activeSubcategories || !activeSubcategories.length || !data[code])
      return null

    return (
      activeSubcategories.reduce((m, sc) => {
        return m + data[code][sc.toLowerCase()] || 0
      }, 0) / activeSubcategories.length
    )
  }

  handleMove = (geography: Geography, evt: window.Event) => {
    const x = evt.clientX + window.pageXOffset
    const y = evt.clientY + window.pageYOffset

    const content =
      geography.properties.iso_a3 === this.props.primaryCode
        ? 'Pick a second country'
        : geography.properties.name
    this.props.dispatch(
      tooltipActions.show({
        origin: {x, y},
        content
      })
    )
  }

  handleZoomIn = (evt: window.Event) => {
    evt.preventDefault()
    evt.stopPropagation()
    this.setState((state: State) => ({
      zoom: state.zoom * ZOOM
    }))
  }

  handleZoomOut = (evt: window.Event) => {
    evt.preventDefault()
    evt.stopPropagation()
    this.setState((state: State) => ({
      zoom: state.zoom / ZOOM,
      center: [0, 0]
    }))
  }

  handleLeave = () => {
    this.props.dispatch(tooltipActions.hide())
  }

  render() {
    const {
      activeSubcategories,
      primaryCode,
      secondaryCode,
      isShowingAll,
      onGeographyClick
    } = this.props

    const {canHover, isOptimizationDisabled, zoom, center} = this.state

    const height = 630
    const width = 959

    return (
      <div
        className={cn('map', {
          'map--collapsed': primaryCode && secondaryCode,
          'map--zoomed': zoom === ZOOM
        })}
        onDoubleClick={zoom === ZOOM ? this.handleZoomOut : this.handleZoomIn}
      >
        {' '}
        <Motion
          defaultStyle={{
            zoom: 1,
            x: 0,
            y: 20
          }}
          style={{
            zoom: spring(zoom, {stiffness: 210, damping: 20}),
            x: spring(center[0], {stiffness: 210, damping: 20}),
            y: spring(center[1], {stiffness: 210, damping: 20})
          }}
        >
          {({zoom, x, y}) => (
            <ComposableMap
              projectionConfig={{
                scale: 205,
                rotation: [-11, 0, 0]
              }}
              width={width}
              height={height}
              style={{
                width: '100%',
                height: 'auto'
              }}
            >
              <ZoomableGroup center={[x, y]} zoom={zoom}>
                <Geographies
                  geographyUrl={'/world-50m-with-population.json'}
                  disableOptimization={isOptimizationDisabled}
                >
                  {(geographies, projection) =>
                    geographies.map((geography, i) => {
                      const code = geography.properties.iso_a3
                      if (excludes.includes(code)) return null

                      let scale
                      if (isShowingAll) {
                        scale = this.getScale(code)
                        if (
                          typeof scale !== 'number' &&
                          !!activeSubcategories.length
                        )
                          return null
                      }

                      const isActive = code === primaryCode
                      const isSecondary = code === secondaryCode

                      // TODO: Import colors from css
                      const color = isShowingAll
                        ? popScale(scale)
                        : isActive
                          ? styles.primary
                          : isSecondary ? styles.secondary : '#33343D'
                      const hoverColor = isShowingAll
                        ? popScale(scale)
                        : isActive
                          ? styles.primary
                          : isSecondary
                            ? styles.secondary
                            : primaryCode ? styles.secondary : styles.primary
                      return (
                        <Geography
                          key={i}
                          id={geography.properties.iso_a3}
                          geography={geography}
                          projection={projection}
                          onClick={onGeographyClick}
                          onMouseMove={canHover ? this.handleMove : null}
                          onMouseLeave={canHover ? this.handleLeave : null}
                          style={{
                            default: {
                              fill: color,
                              outline: 'none',
                              right: -10,
                              left: -10,
                              top: -10,
                              bottom: -10,
                              position: 'absolute'
                            },
                            hover: {
                              fill: hoverColor,
                              outline: 'none',
                              cursor: 'pointer'
                            },
                            pressed: {
                              fill: hoverColor,
                              outline: 'none',
                              opacity: 0.5
                            }
                          }}
                        />
                      )
                    })}
                </Geographies>
              </ZoomableGroup>
            </ComposableMap>
          )}
        </Motion>
      </div>
    )
  }
}

export default withRedux(initStore)(Map)

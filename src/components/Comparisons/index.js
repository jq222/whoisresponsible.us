// @flow
import React, {Component} from 'react'
import './styles.css'
import {DuelComparisons, TopComparisons} from './components'

type Props = {
  activeSubcategories: string[],
  activeSubcategory: string,
  isShowingAll: boolean,
  isShowingParis: boolean,
  isSortedNegative: boolean,
  isVisible: boolean,
  onTopSort: () => mixed,
  primaryCode: string,
  secondaryCode: string
}

export default class Comparisons extends Component<Props> {
  render() {
    const {
      activeSubcategories,
      activeSubcategory,
      isShowingAll,
      isShowingParis,
      isSortedNegative,
      isVisible,
      onTopSort,
      primaryCode,
      secondaryCode
    } = this.props

    return (
      <div className={isVisible ? 'comparisons' : ''}>
        {isShowingAll ? (
          <TopComparisons
            activeSubcategory={activeSubcategory}
            isShowingParis={isShowingParis}
            isSortedNegative={isSortedNegative}
            isVisible={isVisible}
            onSort={onTopSort}
          />
        ) : (
          <DuelComparisons
            activeSubcategories={activeSubcategories}
            isShowingParis={isShowingParis}
            primaryCode={primaryCode}
            secondaryCode={secondaryCode}
          />
        )}
      </div>
    )
  }
}

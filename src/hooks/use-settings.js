import useSWR from 'swr'
import axios from 'axios'
import flatten from 'lodash/flatten'

/**
 * @typedef { Map<string, string> } ListMap
 * @typedef { {logos:[string], walletBlockMap:ListMap , nsfwMap: ListMap, underReviewMap:ListMap, ignoreUriMap:ListMap, feedIgnoreUriMap:ListMap} } SettingsData
 * @typedef { {data: SettingsData, error:Error, isLoading:boolean} } UseSettingsResult
 */

function shuffleLogos(logos) {
  // Shuffles the list daily
  const shuffledLogos = [...logos]
  let currentIndex = shuffledLogos.length
  let temporaryValue
  let randomIndex
  const date = new Date(Date.now())
  let day =
    (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) -
      Date.UTC(date.getFullYear(), 0, 0)) /
    24 /
    60 /
    60 /
    1000
  const random = () => {
    const x = Math.sin(day++) * 1e4
    return x - Math.floor(x)
  }

  while (0 !== currentIndex) {
    randomIndex = Math.floor(random() * currentIndex)
    currentIndex--
    //swap
    temporaryValue = shuffledLogos[currentIndex]
    shuffledLogos[currentIndex] = shuffledLogos[randomIndex]
    shuffledLogos[randomIndex] = temporaryValue
  }

  return shuffledLogos
}

function filterWalletBlockList(restrictedLists, permittedLists) {
  const walletAllowList = flatten(permittedLists)

  // Override with permitted list
  const overiddenList = flatten(restrictedLists).filter(
    (account) => !walletAllowList.includes(account)
  )

  return mapFromList(overiddenList)
}

const mapFromList = (input_list) => {
  const out_map = new Map()
  input_list.forEach((element) => {
    out_map.set(element, 1)
  })

  return out_map
}

/**
 * Fetches the various lists
 * @returns {SettingsData}
 */
async function fetchSettings() {
  const [
    objktBlockMapResponse,
    logosResponse,
    logosPrideResponse,
    teiaRestrictedListResponse,
    teiaPermittedListResponse,
    nsfwResponse,
    photosensitiveResponse,
    underReviewResponse,
    ignoreUriResponse,
    feedIgnoreUriResponse,
  ] = await Promise.all([
    axios.get(import.meta.env.VITE_BLOCKLIST_OBJKT), // loads blocked objkt
    axios.get(`${import.meta.env.VITE_LOGOS}/logos.json`), // list of logos we rotate through
    axios.get(`${import.meta.env.VITE_LOGOS}/logos_pride.json`), // list of logos for the pride month
    axios.get(import.meta.env.VITE_TEIA_RESTRICTED_LIST), // Teia list of restricted accounts
    axios.get(import.meta.env.VITE_TEIA_PERMITTED_LIST), // Teia list of acccounts that override HEN's restricted list
    axios.get(import.meta.env.VITE_TEIA_NSFW_LIST), // Teia list of NSFW tokens that are added by the moderation team
    axios.get(import.meta.env.VITE_TEIA_PHOTOSENSITIVE_LIST), // Teia list of Photosensitive tokens that are added by the moderation team
    axios.get(import.meta.env.VITE_TEIA_UNDER_REVIEW_LIST), // Teia list of under review accounts added by the moderation team
    axios.get(import.meta.env.VITE_TEIA_IGNORE_URI_LIST), // Teia list of uri to ignore added by the moderation team
    axios.get(import.meta.env.VITE_TEIA_FEED_IGNORE_LIST), // Teia list of wallets to ignore only from feeds (created to avoid fundraiser tag abusers)
  ])

  const logoPacks = [logosResponse, logosPrideResponse]

  const logos = logoPacks.flatMap((logoPack) =>
    logoPack.data.logos.map((logo) => ({
      name: logo,
      themable: logoPack.data.themable,
      collection: logoPack.data.collection,
    }))
  )

  const objktBlockMap = mapFromList(
    objktBlockMapResponse.data.map((n) => n.toString())
  )
  const nsfwMap = mapFromList(nsfwResponse.data.map((n) => n.toString()))
  const photosensitiveMap = mapFromList(
    photosensitiveResponse.data.map((n) => n.toString())
  )
  const underReviewMap = mapFromList(underReviewResponse.data)
  const ignoreUriMap = mapFromList(ignoreUriResponse.data)
  const feedIgnoreUriMap = mapFromList(feedIgnoreUriResponse.data)

  const walletBlockMap = filterWalletBlockList(
    [teiaRestrictedListResponse.data],
    [teiaPermittedListResponse.data]
  )
  return {
    logos: shuffleLogos(logos),
    walletBlockMap,
    nsfwMap,
    photosensitiveMap,
    underReviewMap,
    ignoreUriMap,
    objktBlockMap,
    feedIgnoreUriMap,
  }
}

/**
 * Hook to manage shared data (allow/deny lists & logos)
 * @returns {SettingsData}
 */
export default function useSettings() {
  const { data, error, isValidating } = useSWR('/settings', fetchSettings, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
  })

  return {
    ...(data ? data : {}),
    error,
    isLoading: isValidating,
  }
}

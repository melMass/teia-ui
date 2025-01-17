import { useContext, useState } from 'react'
import useLanguage from '@hooks/use-language'
import styles from '@style'
import { MenuItem } from '@components/header/main_menu/MenuItem'
import { walletPreview } from '@utils/string'
import { TeiaContext } from '@context/TeiaContext'
import { Button } from '@atoms/button'
import { motion } from 'framer-motion'
import classnames from 'classnames'
import { Toggle } from '@atoms/toggles'
import useLocalSettings from '@hooks/use-local-settings'
import { RotatingLogo } from '@atoms/logo'
import useSettings from '@hooks/use-settings'
import { Line } from '@atoms/line'

export const Footer = ({ menu, pin }) => {
  const { language } = useLanguage()
  const context = useContext(TeiaContext)
  const [logoSeed, setLogoSeed] = useState(3)
  const { zen, setZen, theme, toggleTheme } = useLocalSettings()
  const { logos } = useSettings()

  const transition = () => {
    return {
      initial: {
        opacity: 0,
        y: 100,
        transition: { duration: 0.2, ease: 'easeOut' },
      },
      animate: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.2, ease: 'easeOut' },
      },
      exit: {
        opacity: 0,
        y: 100,
        transition: { duration: 0.2, ease: 'easeInOut' },
      },
    }
  }

  const classes = classnames({
    [styles.container]: true,
    [styles.pinned]: pin,
  })
  const classes_content = classnames({
    [styles.content]: true,
    [styles.minimal]: !menu,
  })

  return (
    <motion.div {...transition()} className={classes}>
      <Line />
      <motion.footer {...transition()} className={classes_content}>
        <div className={styles.logo}>
          Teia DAO LLC.
          {menu && (
            <Button onClick={() => setLogoSeed(Math.random() * 100)}>
              <RotatingLogo theme={theme} logos={logos} seed={logoSeed} />
            </Button>
          )}
        </div>

        <div className={styles.copyright}>{language.footer.mint}</div>
        {menu && (
          <>
            <div className={styles.menus}>
              <div className={styles.menu_left}>
                <MenuItem className={styles.menu_label} route="about" />
                <MenuItem
                  className={styles.menu_label}
                  label="F.A.Q"
                  route="faq"
                />
              </div>
              <Line vertical />

              <div className={styles.menu_right}>
                <div className={styles.address}>
                  {walletPreview(context.address)}
                </div>
                <MenuItem
                  className={styles.menu_label}
                  label="Mint"
                  route="mint"
                  need_sync
                />
                <MenuItem
                  className={styles.menu_label}
                  label="Assets"
                  route="tz"
                  need_sync
                />
                <MenuItem
                  need_sync
                  className={styles.menu_label}
                  route="collaborate"
                />

                <MenuItem
                  className={styles.menu_label}
                  label="Profile"
                  route="subjkt"
                  need_sync
                />
              </div>
            </div>
            {false && (
              <div className={styles.state_buttons}>
                <Toggle box onToggle={toggleTheme} initial={theme === 'dark'} />
                <Toggle box label="ZEN" onToggle={setZen} toggled={zen} />
              </div>
            )}
          </>
        )}

        {false && (
          <div>
            <div className={styles.warning}>{language.footer.warning}</div>
          </div>
        )}
      </motion.footer>
    </motion.div>
  )
}

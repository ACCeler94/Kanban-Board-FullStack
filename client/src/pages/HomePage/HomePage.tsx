import { Button } from '@mui/material';
import { Parallax, ParallaxLayer } from '@react-spring/parallax';
import { FaCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Icon from '../../assets/icon.svg?react';
import Container from '../../components/common/Container/Container';
import styles from './HomePage.module.css';

const HomePage = () => {
  // Scroll to the element with given id without modifying the url
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const targetId = (e.currentTarget as HTMLAnchorElement).getAttribute('href')?.slice(1);
    if (targetId) {
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <nav className={styles.navbar}>
        <Container>
          <div className={styles.wrapper}>
            <div className={styles.titleContainer}>
              <Icon />
              <h1 className={styles.title}>kanban</h1>
            </div>
            <div className={styles.linksWrapper}>
              <a href='#features' onClick={handleClick} className={styles.link}>
                Features
              </a>
              <a href='#pricing' onClick={handleClick} className={styles.link}>
                Pricing
              </a>
              <Button
                aria-label='My Boards'
                color='primary'
                variant='contained'
                className={`button-small ${styles.button}`}
                component={Link}
                to={'/boards'}
              >
                My Boards
              </Button>
            </div>
          </div>
        </Container>
      </nav>
      <main>
        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>Productivity redefined</h1>
          <h2 className={styles.heroSubTitle}>
            <span className={`${styles.brush} ${styles.underline}`}>Drowning</span> in tasks?
            <span className={`${styles.arch} ${styles.underline}`}> Struggling</span> to keep track
            of projects?
          </h2>
          <p className={styles.heroText}>
            Our Kanban board is designed to simplify task management while keeping you in control.
            Whether you're a solo user or working with a team, our intuitive system helps you
            visualize progress, stay organized, and get things done efficiently.
          </p>
        </section>

        <section id='features' className={styles.features}>
          <Container>
            <h2 className={styles.sectionTitle}>Features</h2>
          </Container>
          <div className={styles.parallaxWrapper}>
            <Parallax pages={2}>
              <ParallaxLayer
                sticky={{ start: 0, end: 2 }}
                className={`${styles.parallaxLayer} ${styles.parallaxLayerLeft}`}
              >
                <div className={`${styles.parallaxContent} ${styles.stickyLeft}`}>
                  <img
                    src='/images/board-images/column.jpeg'
                    alt='Board columns'
                    className={styles.featureImage}
                  />
                </div>
              </ParallaxLayer>
              <ParallaxLayer
                offset={0}
                speed={1}
                className={`${styles.parallaxLayer} ${styles.parallaxLayerRight}`}
              >
                <div className={`${styles.parallaxContent} ${styles.parallaxRight}`}>
                  <p className={styles.featureText}>
                    Intuitive <span className={styles.highlight}>drag and drop</span> controls to
                    make your experience as seamless as possible
                  </p>
                </div>
              </ParallaxLayer>
              <ParallaxLayer
                offset={1}
                speed={1}
                className={`${styles.parallaxLayer} ${styles.parallaxLayerRight}`}
              >
                <div className={`${styles.parallaxContent} ${styles.parallaxRight}`}>
                  <p className={styles.featureText}>
                    Organize your workflow into
                    <span className={`${styles.columnTitle} ${styles.todoWrapper}`}>
                      <FaCircle />
                      TO DO
                    </span>
                    ,
                    <span className={`${styles.columnTitle} ${styles.inProgressWrapper}`}>
                      <FaCircle />
                      IN PROGRESS
                    </span>
                    and
                    <span className={`${styles.columnTitle} ${styles.doneWrapper}`}>
                      <FaCircle />
                      DONE
                    </span>
                    columns to keep track of your progress
                  </p>
                </div>
              </ParallaxLayer>
            </Parallax>
          </div>

          <div className={styles.featureWithImg}>
            <div className={`${styles.featureContent} ${styles.textLeft}`}>
              <p className={styles.featureText}>
                A task too big to complete at once? Add{' '}
                <span className={styles.straight}>subtasks</span> to make it more manageable and
                track their progress individually
              </p>
            </div>
            <div className={`${styles.featureContent} ${styles.imageRight}`}>
              <img
                className={`${styles.featureImage} ${styles.shadow}`}
                src='/images/board-images/task.jpg'
                alt='Task with subtasks'
              />
            </div>
          </div>

          <div className={styles.featuresCentered}>
            <Container>
              <p className={styles.featureText}>
                Create tasks and assign them to one or multiple users -{' '}
                <span className={styles.featureTextThin}>always know who is responsible</span>
              </p>
              <p className={styles.featureText}>
                Your data hidden from prying eyes -{' '}
                <span className={styles.featureTextThin}>
                  you decide who sees your board, add and remove users at will
                </span>
              </p>
            </Container>
          </div>
        </section>

        <section id='pricing'>
          <Container>
            <h2 className={styles.sectionTitle}>Pricing</h2>

            <div className={styles.cardsWrapper}>
              <div className={`${styles.card} ${styles.shadow}`}>
                <h3 className={styles.cardTitle}>Free</h3>
                <p className={styles.cardSubTitle}>
                  for private use and companies{' '}
                  <span className={styles.bold}>up to 25 employees</span>
                </p>
                <ul>
                  <li>All features add-free forever</li>
                  <li>Regular updates</li>
                </ul>
              </div>

              <div className={`${styles.card} ${styles.shadow} ${styles.primary}`}>
                <h3 className={styles.cardTitle}>$5.99/month</h3>
                <p className={styles.cardSubTitle}>
                  for private users and small companies that need something{' '}
                  <span className={styles.bold}>more</span>
                </p>
                <ul>
                  <li>All free tier features</li>
                  <li>Dedicated support chat</li>
                  <li>Priority access to new features</li>
                </ul>
              </div>

              <div className={`${styles.card} ${styles.shadow}`}>
                <h3 className={styles.cardTitle}>$25/month</h3>
                <p className={styles.cardSubTitle}>
                  for companies <span className={styles.bold}>over 25 employees</span>
                </p>
                <ul>
                  <li>All free tier features</li>
                  <li>24/7 support hotline</li>
                  <li>Priority access to new features</li>
                  <li>Dedicated servers</li>
                </ul>
              </div>
            </div>
          </Container>
        </section>
      </main>
      <footer>© 2025 Artur Celer. All Rights Reserved.</footer>
    </>
  );
};

export default HomePage;

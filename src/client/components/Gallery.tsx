import React from 'react';
import './Gallery.scss';

interface Image {
  image: string;
  thumb: string;
}

interface Props {
  images: Image[];
}

interface State {
  activeImage: Image;
}

export default class Gallery extends React.Component<Props, State> {
  state: State = {
    activeImage: this.props.images[0],
  };

  public render() {
    const { images } = this.props;
    const { activeImage } = this.state;
    return (
      <div className="Gallery">
        <div className="Gallery-main">
          <img className="Gallery-main-image" src={activeImage.image} />
        </div>
        <div className="Gallery-pager">
          {images.map(i => (
            <button
              key={i.thumb}
              className={`Gallery-pager-button ${i === activeImage ? 'is-active' : ''}`}
              onClick={() => this.setState({ activeImage: i })}
            />
          ))}
        </div>
      </div>
    );
  }
}

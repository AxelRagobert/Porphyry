import React, { Component } from 'react';
import Button from './Button.jsx';
import Badge from './Badge.jsx';
import { withRouter } from 'react-router-dom';

class Status extends Component {
  render() {
    if(this.props.selectionJSON.data.length === 0)
      return "Tous les items";

    let status = [];

    this.props.selectionJSON.data.forEach((topics, index) => {
      status.push("(");
      if(((topics.selection || []).length + (topics.exclusion || []).length) > 1) {
        status.push();
      }
      let topicsHTML = [
        ...topics.selection.map(topicID => {return {excluded: false, id:topicID, topic: this._getTopic(topicID)}}),
        ...topics.exclusion.map(topicID => {return {excluded: true, id: topicID, topic: this._getTopic(topicID)}})]
        .sort(filter)
        .map(
          t =>
            (t.topic === null)?
              "Thème inconnu":
              <Badge exclusion={t.excluded} id={t.id} name={t.topic.name} _changeItemState={this._changeItemState}/>
        );
      status.push(topicsHTML.map((e, i) => i < topicsHTML.length - 1 ? [e, <Button topics={topics} selectionJSON={this.props.selectionJSON} _changeUnionState={this._changeUnionState}/>] : [e]).reduce((a, b) => a.concat(b))
      );
      status.push(")");

      if(this.props.selectionJSON.data.length > 1 && index < (this.props.selectionJSON.data.length - 1)) {
        status.push(<Button topics={this.props.selectionJSON} selectionJSON={this.props.selectionJSON} _changeUnionState={this._changeUnionState}/>);
      }
    });
    return status;
  }

  _getTopic(id) {
    for (let v of this.props.viewpoints) {
      if (v[id]) return v[id];
    }
    return null;
  }

  _changeItemState = (item, toDelete)  => {
    let found = this.props.selectionJSON.data.find(s => (s.selection || []).includes(item) || (s.exclusion || []).includes(item));
    switchPlace(found, item, toDelete);
    if((!Array.isArray(found.selection) || !found.selection.length) && (!Array.isArray(found.exclusion) || !found.exclusion.length))
      this.props.selectionJSON.data.splice(this.props.selectionJSON.data.indexOf(found), 1);
    this.props.history.push("/?t=" + JSON.stringify(this.props.selectionJSON));
  };
  _changeUnionState = (topic) => {
    if (topic.type=== "intersection"){
      topic.type="union"
    }
    else {
      topic.type="intersection"
    }
    this.props.history.push("/?t=" + JSON.stringify(this.props.selectionJSON));
  };
}

function switchPlace(object, item, toDelete) {
  let index;
  if((index = object.selection.indexOf(item)) > -1) {
    object.selection.splice(index, 1);
    if (!toDelete)
      object.exclusion.push(item);
  }
  else if((index =object.exclusion.indexOf(item)) > -1) {
    object.exclusion.splice(index, 1);
    if (!toDelete)
      object.selection.push(item);
  }
}
function filter(first, second) {
  if (first.topic === null && second.topic === null)
    return 0;

  if (first.topic === null && second.topic !== null)
    return 1;

  if (first.topic !== null && second.topic === null)
    return -1;

  return ((first.topic.name[0] > second.topic.name[0])?1:-1);
}

export default withRouter(Status);

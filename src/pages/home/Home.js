import React, { Component } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons'

import ConversationPeek from '../../components/ConversationPeek';
import userData from './../../store/userData';
import { RSA } from 'react-native-rsa-native';

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        width: "100%",
        height: "100%",
    }, newMessageBtn: {
        alignSelf: 'flex-end',
        padding: 20,
        margin: 20,
        borderRadius: 100,
        backgroundColor: '#627894',
        shadowColor: "#000",
        elevation: 12,
    }
});

export default class Home extends Component {

    constructor(props) {
        super(props);
        this.state = {
            conversations: [],
            loading: false,
            loading_msg: ''
        };
    }

    async componentDidMount() {
        if (this.state.loading) return

        // Load user private keys or generate them (if first time login)
        this.setState({ loading: true, loading_msg: "Loading cryptographic keys..." })
        try {
            await userData.readStateFromStorage()
        } catch (e) {
            this.setState({ loading_msg: "Generating cryptographic keys..." })

            const keys = await RSA.generateKeys(4096)
            this.setState({ loading_msg: "Storing cryptographic keys..." })

            userData.self.rsa_keys = { privateKey: keys.private, publicKey: keys.public }
            await AsyncStorage.setItem('rsa-user-keys', JSON.stringify(userData.self.rsa_keys))

        } finally {
            this.setState({ loading_msg: "Loading messages..." })
            await userData.preformSync()
            userData.subscribe(this.reloadConvos);
            this.reloadConvos();
            this.setState({ loading: false, loading_msg: "" })
        }
    }


    reloadConvos = () => {
        const convos = []
        userData.getAllConversations().forEach((value, key, map) => {
            convos.push(value);
        });
        this.setState({
            conversations: convos.sort((c1, c2) => {
                if (c1.messages.length <= 0)
                    return -1;
                if (c2.messages.length <= 0)
                    return 1;

                return c1.messages[c1.messages.length - 1].when < c2.messages[c2.messages.length - 1].when ? 1 : -1
            })
        });
    }

    render() {
        return (

            <View style={styles.wrapper}>
                {
                    this.state.loading == true
                        ? <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                            <Text>{this.state.loading_msg}</Text>
                            <ActivityIndicator color="#00FFFF" size="large" />
                        </View>
                        : <>
                            <ScrollView>
                                {
                                    this.state.conversations.length > 0
                                        ? this.state.conversations.map(
                                            (convo, index) =>
                                                (<ConversationPeek data={convo} key={index} navigation={this.props.navigation} />)
                                        )
                                        : <Text>No Conversations.</Text>
                                }
                            </ScrollView>
                            <TouchableOpacity style={styles.newMessageBtn} onPress={() => this.props.navigation.navigate('NewConversation')}>
                                <FontAwesomeIcon size={25} icon={faEnvelope} style={{ color: '#fff' }} />
                            </TouchableOpacity>
                        </>
                }
            </View>
        );
    }
}


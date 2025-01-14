import React, {useEffect, useState, useCallback} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {View, Text, FlatList, Platform, StyleSheet, Button} from 'react-native';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import HeaderButton from '../components/HeaderButton';
import * as productsAction from '../store/actions/products';
import ListItem from '../components/ListItem';
import ProgressBar from '../components/ProgressBar';
import Colors from '../constants/Colors';

const ListScreenFunc = props => {
    // const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState();
    const dispatch = useDispatch();
    const products = useSelector(state => state.products.products);
    const isLoading = useSelector(state => state.loading.isLoading);

    const loadProducts = useCallback(async () => {
        setIsRefreshing(true);
        setError(null);
        try {
            await dispatch(productsAction.fetchProducts(page, limit));
            // setProducts(...products, fetched);
        } catch (err) {
            setError(err.message);
        }
        setIsRefreshing(false);
    }, [dispatch, setError, setIsRefreshing, page]);


    // load first time load in component
    useEffect(() => {
        const willFocusSub = props.navigation.addListener(
            'willFocus',
            loadProducts,
        );

        return () => {
            willFocusSub.remove();
        };
    }, [loadProducts]);

    useEffect(() => {
        if (page > 1) {
            console.log('page--', page);
            console.log('Threshold of over 1 reached.');
            // loadProducts();
        } else {
            console.log('No threshold reached.');
            loadProducts();
        }
    }, [page, dispatch, loadProducts]);

    const renderItem = ({item}) => <ListItem item={item}/>;

    console.log('products....------.', products.length);


    if (error) {
        return (
            <View style={styles.centered}>
                <Text>An error occurred!</Text>
                <Button
                    title="Try again"
                    onPress={loadProducts}
                    color={Colors.primary}
                />
            </View>
        );
    }

    if (isLoading) {
        return <ProgressBar/>;
    }

    if (!isLoading && products.length === 0) {
        return (
            <View style={styles.centered}>
                <Text>No products found</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={products}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            onRefresh={loadProducts}
            refreshing={isRefreshing}
            onEndReached={() => setPage(page + 1)}
            onEndReachedThreshold={0.5}
        />
    );
};

ListScreenFunc.navigationOptions = navData => {
    return {
        title: 'List',
        headerLeft: (
            <HeaderButtons HeaderButtonComponent={HeaderButton}>
                <Item
                    title="Menu"
                    iconName={Platform.OS === 'android' ? 'md-menu' : 'ios-menu'}
                    onPress={() => navData.navigation.toggleDrawer()}
                />
            </HeaderButtons>
        ),
    };
};

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ListScreenFunc;
